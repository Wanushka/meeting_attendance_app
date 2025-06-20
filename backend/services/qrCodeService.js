const QRCode = require('qrcode');

class QRCodeService {
  static async generateQRCode(data) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data);
      return qrCodeDataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code: ' + error.message);
    }
  }
}

module.exports = QRCodeService;