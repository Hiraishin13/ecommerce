<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Core\Controller;
use App\Core\Request;
use App\Core\Response;
use App\Models\OrderModel;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;

class WebhookController extends Controller
{
    private OrderModel $orders;

    public function __construct()
    {
        $this->orders = new OrderModel();
    }

    public function stripe(Request $request, Response $response): void
    {
        $payload   = file_get_contents('php://input');
        $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
        $secret    = $_ENV['STRIPE_WEBHOOK_SECRET'] ?? '';

        if (empty($payload)) {
            $response->error('Empty payload.', 400);
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\UnexpectedValueException $e) {
            $response->error('Invalid payload.', 400);
        } catch (SignatureVerificationException $e) {
            $response->error('Invalid signature.', 400);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $paymentIntent = $event->data->object;
                $order = $this->orders->findByStripePaymentIntent($paymentIntent->id);

                if ($order) {
                    $this->orders->updateStatus((int) $order['id'], 'paid');
                }
                break;

            case 'payment_intent.payment_failed':
                $paymentIntent = $event->data->object;
                $order = $this->orders->findByStripePaymentIntent($paymentIntent->id);

                if ($order && $order['status'] === 'pending') {
                    // Leave as pending — customer may retry
                }
                break;

            default:
                // Unhandled event type — acknowledge and ignore
                break;
        }

        $response->success(null, 'Webhook processed.');
    }
}
