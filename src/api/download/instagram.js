const axios = require('axios');
const cheerio = require('cheerio');

module.exports = async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ status: false, error: 'Parámetro "url" es requerido.' });
  }

  try {
    const response = await axios.get(
      `https://snapdownloader.com/tools/instagram-downloader/download?url=${encodeURIComponent(url)}`
    );
    const $ = cheerio.load(response.data);
    const result = { type: null, links: [] };

    const videoItems = $('.download-item').filter((i, el) =>
      $(el).find('.type').text().trim().toLowerCase() === 'video'
    );

    if (videoItems.length > 0) {
      result.type = 'video';
      videoItems.find('.btn-download').each((i, el) => {
        const link = $(el).attr('href');
        if (link) result.links.push(link);
      });
    } else {
      const photoLink = $('.profile-info .btn-download').attr('href');
      if (photoLink) {
        result.type = 'photo';
        result.links.push(photoLink);
      } else {
        return res.status(415).json({ status: false, error: 'Tipo de contenido no soportado' });
      }
    }

    return res.json({ status: true, data: result });
  } catch (err) {
    console.error('Error en /download/instagram:', err.message);
    return res.status(500).json({ status: false, error: 'Error interno en el scraper' });
  }
};