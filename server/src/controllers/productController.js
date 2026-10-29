const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const imagekit = require('../lib/imagekit');
const fs = require('fs');
const path = require('path');

exports.getProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' }
  });

  const parsed = products.map(p => ({
    ...p,
    features: p.features ? JSON.parse(p.features) : [],
    specs: p.specs ? JSON.parse(p.specs) : {}
  }));

  return res.json({ success: true, products: parsed });
});

exports.getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug },
        { id: isNaN(slug) ? undefined : parseInt(slug) }
      ]
    }
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return res.json({
    success: true,
    product: {
      ...product,
      features: product.features ? JSON.parse(product.features) : [],
      specs: product.specs ? JSON.parse(product.specs) : {}
    }
  });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const { title, subtitle, price, originalPrice, description, image, features, specs, badge, stock } = req.body;

  if (!title || !price) {
    throw new ApiError(400, 'Title and price are required');
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);

  const product = await prisma.product.create({
    data: {
      title,
      subtitle: subtitle || '',
      slug,
      price: parseFloat(price),
      originalPrice: parseFloat(originalPrice || price * 1.5),
      badge: badge || 'New',
      stock: parseInt(stock || 100),
      image: image || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
      description: description || '',
      features: JSON.stringify(Array.isArray(features) ? features : (features ? features.split('\n').filter(Boolean) : [])),
      specs: JSON.stringify(typeof specs === 'object' ? specs : {})
    }
  });

  return res.status(201).json({
    success: true,
    product: {
      ...product,
      features: JSON.parse(product.features),
      specs: JSON.parse(product.specs)
    },
    message: 'Product added successfully!'
  });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, subtitle, price, originalPrice, description, image, features, specs, badge, stock } = req.body;

  const existing = await prisma.product.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existing) {
    throw new ApiError(404, 'Product not found');
  }

  const updated = await prisma.product.update({
    where: { id: parseInt(id) },
    data: {
      title: title || existing.title,
      subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
      price: price ? parseFloat(price) : existing.price,
      originalPrice: originalPrice ? parseFloat(originalPrice) : existing.originalPrice,
      badge: badge !== undefined ? badge : existing.badge,
      stock: stock !== undefined ? parseInt(stock) : existing.stock,
      image: image || existing.image,
      description: description !== undefined ? description : existing.description,
      features: features ? JSON.stringify(Array.isArray(features) ? features : features.split('\n').filter(Boolean)) : existing.features,
      specs: specs ? JSON.stringify(typeof specs === 'object' ? specs : {}) : existing.specs
    }
  });

  return res.json({
    success: true,
    product: {
      ...updated,
      features: JSON.parse(updated.features),
      specs: JSON.parse(updated.specs)
    },
    message: 'Product updated successfully'
  });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({
    where: { id: parseInt(id) }
  });
  return res.json({ success: true, message: 'Product deleted successfully' });
});

exports.uploadProductImage = asyncHandler(async (req, res) => {
  const { image, fileName = 'upload.jpg' } = req.body;

  if (!image) {
    throw new ApiError(400, 'No file data provided');
  }

  const isPdf = fileName.toLowerCase().endsWith('.pdf') || image.startsWith('data:application/pdf');
  const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

  // 1. Try ImageKit upload first if configured
  if (process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_PUBLIC_KEY) {
    const uploadResponse = await imagekit.upload({
      file: image,
      fileName: `reviewxpress-${Date.now()}-${safeName}`,
      folder: '/reviewxpress/products'
    }).catch(ikErr => {
      console.warn('ImageKit upload fallback to local storage:', ikErr.message);
      return null;
    });

    if (uploadResponse && uploadResponse.url) {
      return res.json({
        success: true,
        url: uploadResponse.url,
        provider: 'imagekit',
        fileId: uploadResponse.fileId,
        isPdf,
        fileName: safeName
      });
    }
  }

  // 2. Safe Local Storage (Supports both images and PDF documents)
  const base64Data = image.replace(/^data:[a-zA-Z0-9_\-\.\/]+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  const cleanFileName = `file-${Date.now()}-${safeName}`;
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const filePath = path.join(uploadDir, cleanFileName);

  fs.writeFileSync(filePath, buffer);

  const serverUrl = process.env.SERVER_BASE_URL || 'http://localhost:5000';
  const localUrl = `${serverUrl}/uploads/${cleanFileName}`;

  return res.json({
    success: true,
    url: localUrl,
    provider: 'local',
    isPdf,
    fileName: safeName
  });
});
