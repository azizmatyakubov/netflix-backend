import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export const sendEmail = async (recipent, subject, message) => {
    const msg = {
        to: recipent,
        from: process.env.SENDER,
        subject: subject,
        text: message,
        html: `<strong>${message}</strong>`
    }

    await sgMail.send(msg)
}