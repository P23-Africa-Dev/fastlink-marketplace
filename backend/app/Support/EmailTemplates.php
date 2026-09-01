<?php

namespace App\Support;

/**
 * Maps notification types → Blade email templates under resources/views/emails/.
 */
class EmailTemplates
{
    /**
     * @return array{template: string, subject: string}|null
     */
    public static function resolve(string $type, string $fallbackTitle, string $fallbackBody): ?array
    {
        $map = [
            'account.welcome_buyer' => ['welcome-buyer', 'Welcome to Fastlink Marketplace'],
            'account.welcome_seller' => ['welcome-seller', 'Welcome, seller — let’s get your store ready'],
            'account.welcome_rider' => ['welcome-rider', 'Welcome to Fastlink Deliveries'],
            'account.password_reset' => ['password-reset', 'Reset your Fastlink password'],
            'account.password_changed' => ['password-changed', 'Your Fastlink password was changed'],
            'account.suspended' => ['account-suspended', 'Your Fastlink account was suspended'],
            'account.activated' => ['account-activated', 'Your Fastlink account is active again'],

            'store.onboarded' => ['seller-onboarded', 'Your store is set up on Fastlink'],
            'store.kyc_submitted' => ['seller-kyc-submitted', 'KYC received — under review'],
            'store.kyc_reminder' => ['seller-kyc-reminder', 'Complete your KYC to sell on Fastlink'],
            'store.approved' => ['seller-approved', 'Your store was approved'],
            'store.rejected' => ['seller-rejected', 'Store application update'],
            'store.suspended' => ['seller-suspended', 'Your store was suspended'],

            'application.store_submitted' => ['admin-application', 'New seller application'],
            'application.rider_submitted' => ['admin-application', 'New rider application'],

            'rider.applied' => ['rider-applied', 'Rider application received'],
            'rider.approved' => ['rider-approved', 'You’re approved to deliver'],
            'rider.rejected' => ['rider-rejected', 'Rider application update'],
            'rider.assigned' => ['rider-assigned', 'New delivery assignment'],

            'order.placed' => ['order-placed', 'We received your order'],
            'order.paid' => ['order-paid', 'Payment confirmed'],
            'order.confirmed' => ['order-status', 'Your order was confirmed'],
            'order.shipped' => ['order-status', 'Your order is on the way'],
            'order.delivered' => ['order-status', 'Your order was delivered'],
            'order.cancelled' => ['order-status', 'Your order was cancelled'],
            'sale.order.placed' => ['seller-new-order', 'New order awaiting payment'],
            'sale.order.paid' => ['seller-new-order', 'New paid order'],

            'return.requested' => ['return-update', 'Return requested'],
            'return.approved' => ['return-update', 'Return approved'],
            'return.rejected' => ['return-update', 'Return declined'],

            'dispute.opened' => ['dispute-update', 'Dispute opened'],
            'dispute.seller_responded' => ['dispute-update', 'Seller responded to your dispute'],
            'dispute.resolved' => ['dispute-update', 'Dispute resolved'],

            'inventory.low_stock' => ['low-stock', 'Low stock alert'],
            'inventory.out_of_stock' => ['low-stock', 'Out of stock alert'],

            'product.submitted' => ['product-moderation', 'Listing submitted for review'],
            'product.approved' => ['product-moderation', 'Your listing was approved'],
            'product.rejected' => ['product-moderation', 'Your listing was rejected'],
            'product.unpublished' => ['product-moderation', 'Your listing was unpublished'],

            'payout.requested' => ['payout-update', 'Payout request received'],
            'payout.approved' => ['payout-update', 'Payout approved'],
            'payout.rejected' => ['payout-update', 'Payout rejected'],

            'staff.invited' => ['staff-invited', 'You’ve been added to a store team'],
            'cart.abandoned' => ['cart-abandoned', 'You left items in your cart'],
            'message.received' => ['message-received', 'New message on Fastlink'],
            'support.ticket_created' => ['support-update', 'Support ticket created'],
            'support.ticket_replied' => ['support-update', 'New reply on your support ticket'],
            'chargeback.opened' => ['chargeback-update', 'Chargeback opened'],
            'chargeback.updated' => ['chargeback-update', 'Chargeback update'],
            'review.received' => ['review-update', 'New review on your product'],
            'review.replied' => ['review-update', 'Seller replied to your review'],
        ];

        if (! isset($map[$type])) {
            return [
                'template' => 'generic',
                'subject' => $fallbackTitle,
            ];
        }

        [$template, $subject] = $map[$type];

        return [
            'template' => $template,
            'subject' => $subject !== '' ? $subject : $fallbackTitle,
            'body' => $fallbackBody,
        ];
    }
}
