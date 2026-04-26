import QRCode from 'qrcode'

export function generateQRDataURL(url, size = 200) {
  return QRCode.toDataURL(url, { width: size, margin: 1, color: { dark: '#052e16', light: '#ffffff' } })
}
