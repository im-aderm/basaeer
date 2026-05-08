-- CreateTable
CREATE TABLE "ProviderHealthLog" (
    "id" TEXT NOT NULL,
    "providerType" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latency" INTEGER,
    "error" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderHealthLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "eventType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryWebhookLog" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "status" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryWebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RealtimeConnection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "socketId" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealtimeConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueMetric" (
    "id" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "waitingCount" INTEGER NOT NULL,
    "activeCount" INTEGER NOT NULL,
    "completedCount" INTEGER NOT NULL,
    "failedCount" INTEGER NOT NULL,
    "delayedCount" INTEGER NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderFailoverEvent" (
    "id" TEXT NOT NULL,
    "failedProvider" TEXT NOT NULL,
    "targetProvider" TEXT NOT NULL,
    "reason" TEXT,
    "providerType" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderFailoverEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageRetryEvent" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL,
    "error" TEXT,
    "nextRetryAt" TIMESTAMP(3),
    "status" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageRetryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderBalanceSnapshot" (
    "id" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderBalanceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDeliveryEvent" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDeliveryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProviderHealthLog_branchId_idx" ON "ProviderHealthLog"("branchId");

-- CreateIndex
CREATE INDEX "WebhookEvent_branchId_idx" ON "WebhookEvent"("branchId");

-- CreateIndex
CREATE INDEX "DeliveryWebhookLog_branchId_idx" ON "DeliveryWebhookLog"("branchId");

-- CreateIndex
CREATE INDEX "DeliveryWebhookLog_messageId_idx" ON "DeliveryWebhookLog"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "RealtimeConnection_socketId_key" ON "RealtimeConnection"("socketId");

-- CreateIndex
CREATE INDEX "RealtimeConnection_branchId_idx" ON "RealtimeConnection"("branchId");

-- CreateIndex
CREATE INDEX "RealtimeConnection_userId_idx" ON "RealtimeConnection"("userId");

-- CreateIndex
CREATE INDEX "QueueMetric_branchId_idx" ON "QueueMetric"("branchId");

-- CreateIndex
CREATE INDEX "ProviderFailoverEvent_branchId_idx" ON "ProviderFailoverEvent"("branchId");

-- CreateIndex
CREATE INDEX "MessageRetryEvent_branchId_idx" ON "MessageRetryEvent"("branchId");

-- CreateIndex
CREATE INDEX "MessageRetryEvent_messageId_idx" ON "MessageRetryEvent"("messageId");

-- CreateIndex
CREATE INDEX "ProviderBalanceSnapshot_branchId_idx" ON "ProviderBalanceSnapshot"("branchId");

-- CreateIndex
CREATE INDEX "NotificationDeliveryEvent_branchId_idx" ON "NotificationDeliveryEvent"("branchId");

-- CreateIndex
CREATE INDEX "NotificationDeliveryEvent_notificationId_idx" ON "NotificationDeliveryEvent"("notificationId");

-- AddForeignKey
ALTER TABLE "ProviderHealthLog" ADD CONSTRAINT "ProviderHealthLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookEvent" ADD CONSTRAINT "WebhookEvent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryWebhookLog" ADD CONSTRAINT "DeliveryWebhookLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealtimeConnection" ADD CONSTRAINT "RealtimeConnection_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RealtimeConnection" ADD CONSTRAINT "RealtimeConnection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueMetric" ADD CONSTRAINT "QueueMetric_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderFailoverEvent" ADD CONSTRAINT "ProviderFailoverEvent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageRetryEvent" ADD CONSTRAINT "MessageRetryEvent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderBalanceSnapshot" ADD CONSTRAINT "ProviderBalanceSnapshot_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDeliveryEvent" ADD CONSTRAINT "NotificationDeliveryEvent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
