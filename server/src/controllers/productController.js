const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const imagekit = require('../lib/imagekit');
const fs = require('fs');
const path = require('path');

// In-memory cache for product catalog
let cachedProducts = null;
let lastProductsFetch = 0;
const PRODUCTS_CACHE_TTL = 60 * 1000;

function clearProductsCache() {
  cachedProducts = null;
  lastProductsFetch = 0;
}
exports.clearProductsCache = clearProductsCache;

function safeJsonParse(str, fallback) {
  if (!str) return fallback;
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

function formatFeatures(features) {
  if (!features) return [];
  if (Array.isArray(features)) {
    return features.map(f => String(f).trim()).filter(Boolean);
  }
  if (typeof features === 'string') {
    return features
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);
  }
  return [];
}

function formatSpecs(specs) {
  if (!specs) return {};
  if (typeof specs === 'string') {
    const trimmed = specs.trim();
    if (trimmed.startsWith('{')) {
      try {
        return JSON.parse(trimmed);
      } catch (e) {
        return {};
      }
    }
    const result = {};
    trimmed.split('\n').forEach(line => {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const key = line.substring(0, idx).trim();
        const val = line.substring(idx + 1).trim();
        if (key) result[key] = val;
      }
    });
    return result;
  }
  if (typeof specs === 'object' && !Array.isArray(specs)) {
    return specs;
  }
  return {};
}

exports.getProducts = asyncHandler(async (req, res) => {
  const now = Date.now();
  if (cachedProducts && (now - lastProductsFetch < PRODUCTS_CACHE_TTL)) {
    return res.json({ success: true, products: cachedProducts });
  }

  const products = await prisma.product.findMany({
    orderBy: [
      { displayOrder: 'asc' },
      { id: 'asc' }
    ]
  });

  const parsed = products.map(p => ({
    ...p,
    features: safeJsonParse(p.features, []),
    specs: safeJsonParse(p.specs, {})
  }));

  cachedProducts = parsed;
  lastProductsFetch = Date.now();

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
      features: safeJsonParse(product.features, []),
      specs: safeJsonParse(product.specs, {})
    }
  });
});

exports.createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    subtitle,
    price,
    originalPrice,
    description,
    image,
    features,
    specs,
    badge,
    stock,
    displayOrder,
    isActive,
    commissionPercent
  } = req.body;

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
      displayOrder: parseInt(displayOrder || 0),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      image: image || 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
      description: description || '',
      features: JSON.stringify(formatFeatures(features)),
      specs: JSON.stringify(formatSpecs(specs)),
      commissionPercent: commissionPercent !== undefined && commissionPercent !== '' && !isNaN(commissionPercent)
        ? parseFloat(commissionPercent)
        : 0.0
    }
  });

  clearProductsCache();
  return res.status(201).json({
    success: true,
    product: {
      ...product,
      features: safeJsonParse(product.features, []),
      specs: safeJsonParse(product.specs, {})
    },
    message: 'Product added successfully!'
  });
});

exports.updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    subtitle,
    price,
    originalPrice,
    description,
    image,
    features,
    specs,
    badge,
    stock,
    displayOrder,
    isActive,
    commissionPercent
  } = req.body;

  const existing = await prisma.product.findUnique({
    where: { id: parseInt(id) }
  });

  if (!existing) {
    throw new ApiError(404, 'Product not found');
  }

  const updateData = {
    title: title || existing.title,
    subtitle: subtitle !== undefined ? subtitle : existing.subtitle,
    price: price ? parseFloat(price) : existing.price,
    originalPrice: originalPrice ? parseFloat(originalPrice) : existing.originalPrice,
    badge: badge !== undefined ? badge : existing.badge,
    stock: stock !== undefined ? parseInt(stock) : existing.stock,
    displayOrder: displayOrder !== undefined ? parseInt(displayOrder) : existing.displayOrder,
    isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
    image: image || existing.image,
    description: description !== undefined ? description : existing.description
  };

  if (features !== undefined) {
    updateData.features = JSON.stringify(formatFeatures(features));
  }
  if (specs !== undefined) {
    updateData.specs = JSON.stringify(formatSpecs(specs));
  }
  if (commissionPercent !== undefined) {
    updateData.commissionPercent = (commissionPercent === '' || isNaN(commissionPercent))
      ? 0.0
      : parseFloat(commissionPercent);
  }

  const updated = await prisma.product.update({
    where: { id: parseInt(id) },
    data: updateData
  });

  clearProductsCache();
  return res.json({
    success: true,
    product: {
      ...updated,
      features: safeJsonParse(updated.features, []),
      specs: safeJsonParse(updated.specs, {})
    },
    message: 'Product updated successfully'
  });
});

exports.reorderProducts = asyncHandler(async (req, res) => {
  const { orders } = req.body; // array of { id, displayOrder }
  if (Array.isArray(orders)) {
    await prisma.$transaction(
      orders.map(o =>
        prisma.product.update({
          where: { id: parseInt(o.id) },
          data: { displayOrder: parseInt(o.displayOrder) }
        })
      )
    );
  }
  clearProductsCache();
  return res.json({ success: true, message: 'Products display ordering updated' });
});

exports.deleteProduct = asyncHandler(async (req, res) => {
  const productId = parseInt(req.params.id);

  if (isNaN(productId)) {
    throw new ApiError(400, 'Invalid product ID');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      partnerLinks: true
    }
  });

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const partnerLinkIds = (product.partnerLinks || []).map(l => l.id);

  // Perform clean cascade in a database transaction
  await prisma.$transaction(async (tx) => {
    if (partnerLinkIds.length > 0) {
      // 1. Detach orders referencing these partner links to preserve customer order history
      await tx.order.updateMany({
        where: { partnerLinkId: { in: partnerLinkIds } },
        data: { partnerLinkId: null }
      });

      // 2. Delete the associated partner product links
      await tx.partnerProductLink.deleteMany({
        where: { productId }
      });
    }

    // 3. Delete the product itself
    await tx.product.delete({
      where: { id: productId }
    });
  });

  clearProductsCache();
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
