import sgMail from "@sendgrid/mail";
import {getPdfReadableStream} from '../lib/pdf-tools.js'


sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async (recipent, subject, message) => {
    const book = {
        "Title": "new movie",
        "Year": "2011",
        "Type": "movie",
        "Poster": "http://localhost:4000/image/etxcy59pol1ysvh06.jpg",
        "_id": "etxcy59pol1ysvh06",
        "reviews": []
      }

    const pdfAsStream = getPdfReadableStream(book)
    const arrayOfChunks = [];
    pdfAsStream.on("data",  function (chunk) {
      arrayOfChunks.push(chunk);
    });
    pdfAsStream.on("end", async function () {
      const pdfAsBuffer = Buffer.concat(arrayOfChunks);
      const attachment = pdfAsBuffer.toString("base64");

    const msg = {
        to: recipent,
        from: process.env.SENDER,
        subject: subject,
        text: message,
        html: `<strong>${message}</strong>`,
        attachments: [
            {
              content: attachment,
              filename: "attachment.pdf",
              type: "application/pdf",
              disposition: "attachment",
            },
          ],
    }

    await sgMail.send(msg)

})
}