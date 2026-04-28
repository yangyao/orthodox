CREATE INDEX "order_items_product_id_idx" ON "order_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "order_items_order_id_idx" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "orders_status_paid_at_idx" ON "orders" USING btree ("status","paid_at");--> statement-breakpoint
CREATE INDEX "orders_type_paid_at_idx" ON "orders" USING btree ("order_type","paid_at");--> statement-breakpoint
CREATE INDEX "orders_user_created_at_idx" ON "orders" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "payment_txns_status_paid_at_idx" ON "payment_transactions" USING btree ("status","paid_at");--> statement-breakpoint
CREATE INDEX "payment_txns_method_status_paid_at_idx" ON "payment_transactions" USING btree ("payment_method","status","paid_at");--> statement-breakpoint
CREATE INDEX "idx_wallet_ledger_type_created" ON "wallet_ledger_entries" USING btree ("entry_type","created_at");