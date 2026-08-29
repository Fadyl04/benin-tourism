import transporter from "../../config/mail.config.js";


export const sendEmail = async ({
    to,
    subject,
    html,
    attachments = []
}) => {

    try {

        await transporter.sendMail({

            from: `"Tourisme Bénin" <${process.env.EMAIL_USER}>`,

            to,

            subject,

            html,

            attachments

        });


        console.log(
            `Email envoyé à ${to}`
        );


    } catch(error) {

        console.error(
            "Erreur envoi email :",
            error
        );

        throw error;
    }

};