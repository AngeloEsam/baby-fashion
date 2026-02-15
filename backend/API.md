# Baby Fashion API Documentation

**Base URL:** `http://localhost:5000/api`

---

## Health Check

```
GET /api/health
```

---

## Products

### Get All Products
```
GET /api/products
```

### Get Products by Category
```
GET /api/products?category=dresses
```
Categories: `dresses`, `suits`, `tshirts`, `jackets`, `pants`

### Get Single Product
```
GET /api/products/:id
```

### Create Product
You can send data either as **JSON** (for links) or **form-data** (for real file uploads).

#### Option A: Real File Upload (Recommended for Performance)
Use **form-data** in Postman:
- `images`: Select "File" type and upload up to 5 images. **Sharp** will resize and convert them to WebP automatically.
- `nameAr`, `nameEn`, `price`, etc.: Normal text fields.
- `sizes`: Sends as a JSON string like `["2-5", "6-9"]` or comma-separated `2-5, 6-9`.

#### Option B: JSON (For External Links)
```
POST /api/products
Content-Type: application/json

{
  "nameAr": "فستان أطفال",
  "nameEn": "Kids Dress",
  "price": 300,
  "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
  "sizes": ["2-5", "6-9"],
  "category": "dresses"
}
```

### Update Product
```
PUT /api/products/:id
Content-Type: application/json

{
  "price": 350,
  "isSale": false
}
```

### Delete Product
```
DELETE /api/products/:id
```

### Seed Sample Products
```
POST /api/products/seed
```

---

## Orders

### Get All Orders
```
GET /api/orders
```

### Get Orders by Status
```
GET /api/orders?status=pending
```
Statuses: `pending`, `confirmed`, `delivered`, `cancelled`

### Get Single Order
```
GET /api/orders/:id
```

### Create Order
```
POST /api/orders
Content-Type: application/json

{
  "customerName": "Ahmed Mohamed",
  "phone": "01012345678",
  "location": "Cairo, Egypt - Nasr City",
  "notes": "Please call before delivery",
  "items": [
    {
      "productId": "PRODUCT_ID_HERE",
      "name": "Luxury Kids Dress",
      "size": "4-5",
      "quantity": 2,
      "price": 250,
      "image": "https://example.com/image.jpg"
    }
  ],
  "totalAmount": 500
}
```

### Update Order Status
```
PATCH /api/orders/:id
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Delete Order
```
DELETE /api/orders/:id
```
