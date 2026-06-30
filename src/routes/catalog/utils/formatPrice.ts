export function formatPrice (product: {
  price?: number
  minPrice?: number
  maxPrice?: number
}): string {
  if (product.price !== undefined) {
    return product.price.toLocaleString()
  } else if (product.minPrice !== undefined && product.maxPrice !== undefined) {
    return `${product.minPrice.toLocaleString()} - ${product.maxPrice.toLocaleString()}`
  } else if (product.minPrice !== undefined) {
    return `${product.minPrice.toLocaleString()}+`
  } else if (product.maxPrice !== undefined) {
    return `Hasta ${product.maxPrice.toLocaleString()}`
  } else {
    return 'N/A'
  }
}
