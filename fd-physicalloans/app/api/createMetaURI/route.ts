import { IncomingForm } from "formidable";
import fs from 'fs';
import axios from "axios";
import FormData from "form-data";

export const config = {
  api: {
    bodyParser: false, // necesario para procesar archivos
  },
};

function readFileAsync(path) {
  return new Promise((resolve, reject) =>
    fs.readFile(path, (err, data) => (err ? reject(err) : resolve(data)))
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = new IncomingForm({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Error parsing form' });

    const name = fields.name[0];
    const description = fields.description[0];
    const type = fields.type[0];
 
    if (!name || name == undefined || !description  || description == undefined || !type || type == undefined) {
      return res.status(400).json({ error: "Missing required metadata fields" });
    }

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image;
    if (!imageFile?.filepath) {
      return res.status(400).json({ error: "No image file received" });
    }

    try {
      const imageData = await readFileAsync(imageFile.filepath);

      const formData = new FormData();
      formData.append("file", imageData, imageFile.originalFilename);

      const imageUploadRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        maxBodyLength: Infinity,
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          ...formData.getHeaders(),
        },
      });

      const imageHash = imageUploadRes.data.IpfsHash;
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imageHash}`;

      // 2. Crear metadata
      const metadata = {
        name,
        description,
        image: imageUrl,
        attributes: [{ trait_type: "type", value: type }],
      };

      // 3. Subir metadata a IPFS
      const metadataRes = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        metadata,
        {
          headers: {
            Authorization: `Bearer ${process.env.PINATA_JWT}`,
            "Content-Type": "application/json",
          },
        }
      );

      const metadataHash = metadataRes.data.IpfsHash;
      const tokenURI = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;

      return res.status(200).json({ tokenURI });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
}