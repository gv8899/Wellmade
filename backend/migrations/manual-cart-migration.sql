-- 創建購物車表
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
  "sessionId" VARCHAR,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);

-- 創建購物車項目表
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "cartId" UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  "productId" UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
  "variantId" UUID,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10, 2) DEFAULT 0,
  name VARCHAR,
  cover VARCHAR,
  specs JSONB,
  "createdAt" TIMESTAMP DEFAULT now(),
  "updatedAt" TIMESTAMP DEFAULT now()
);
