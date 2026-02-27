export async function sendPushNotification(fcmToken, title, body, data = {}) {
  try {
    console.log(`[FCM] Sending notification to ${fcmToken}`);
    console.log(`[FCM] Title: ${title}`);
    console.log(`[FCM] Body: ${body}`);
    console.log(`[FCM] Data:`, data);

    return { success: true, message: 'Notification sent' };
  } catch (error) {
    console.error('[FCM] Error sending notification:', error);
    return { success: false, error: error.message };
  }
}

export async function sendPaymentReminder(user, payment) {
  if (!user?.fcm_token) {
    console.log('[FCM] No FCM token for user');
    return;
  }

  const daysOverdue = Math.floor((Date.now() - new Date(payment.due_date).getTime()) / (1000 * 60 * 60 * 24));
  const title = daysOverdue > 0 ? 'Payment Overdue' : 'Payment Due Soon';
  const body =
    daysOverdue > 0
      ? `Your payment of ₹${payment.amount} is ${daysOverdue} days overdue`
      : `Your payment of ₹${payment.amount} is due on ${new Date(payment.due_date).toLocaleDateString('en-IN')}`;

  await sendPushNotification(user.fcm_token, title, body, {
    paymentId: payment.id,
    amount: payment.amount.toString(),
    type: payment.payment_type,
  });
}

export async function sendAccessRevokedNotification(user, accessType) {
  if (!user?.fcm_token) {
    console.log('[FCM] No FCM token for user');
    return;
  }

  const title = 'Access Suspended';
  const body = `Your ${accessType} access has been suspended due to non-payment. Please complete your payment to restore access.`;

  await sendPushNotification(user.fcm_token, title, body, {
    accessType,
    action: 'payment_required',
  });
}

export async function sendPaymentSuccessNotification(user, payment) {
  if (!user?.fcm_token) {
    console.log('[FCM] No FCM token for user');
    return;
  }

  const title = 'Payment Successful';
  const body = `Your payment of ₹${payment.amount} has been processed successfully.`;

  await sendPushNotification(user.fcm_token, title, body, {
    paymentId: payment.id,
    status: 'completed',
  });
}

export async function sendSubscriptionRenewalNotification(user, subscription) {
  if (!user?.fcm_token) {
    console.log('[FCM] No FCM token for user');
    return;
  }

  const title = 'Subscription Renewing Soon';
  const renewalDate = new Date(subscription.next_billing_date).toLocaleDateString('en-IN');
  const body = `Your ${subscription.subscription_type} subscription will renew on ${renewalDate}.`;

  await sendPushNotification(user.fcm_token, title, body, {
    subscriptionId: subscription.id,
    type: subscription.subscription_type,
  });
}
