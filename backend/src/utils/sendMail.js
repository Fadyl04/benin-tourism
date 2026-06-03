import transporter from "../config/mail.config.js";


/**
 * Réinitialisation du mot de passe
 */
export const sendResetPasswordEmail = async (
  toEmail,
  resetLink
) => {

  await transporter.sendMail({

    from: process.env.EMAIL_USER,

    to: toEmail,

    subject:
      "Réinitialisation de votre mot de passe — Tourisme Bénin",

    html: `
      <!DOCTYPE html>
      <html lang="fr">

        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Réinitialisation de mot de passe</title>
        </head>

        <body style="
          margin:0;
          padding:0;
          background:#f4f6fa;
          font-family:'Helvetica Neue', Arial, sans-serif;
        ">

          <!-- PREHEADER (important pour Gmail) -->
          <div style="
            display:none;
            max-height:0;
            overflow:hidden;
            opacity:0;
            color:transparent;
          ">
            Réinitialisez votre mot de passe Tourisme Bénin en toute sécurité.
          </div>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa; padding:40px 16px;">
            <tr>
              <td align="center">

                <!-- CARD -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
                  max-width:580px;
                  background:#ffffff;
                  border-radius:12px;
                  overflow:hidden;
                  box-shadow:0 8px 32px rgba(10,55,100,0.12);
                ">

                  <!-- HEADER -->
                  <tr>
                    <td style="background:#0a3764; padding:0;">

                      <!-- GOLD BAR -->
                      <div style="height:3px; background:linear-gradient(90deg,#FFBE00,#e6aa00);"></div>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding:24px 28px 20px; text-align:center;">

                            <div style="
                              color:#ffffff;
                              font-size:13px;
                              font-weight:700;
                              text-transform:uppercase;
                              letter-spacing:0.05em;
                              text-align:center;
                            ">
                              Tourisme Bénin
                            </div>

                            <div style="
                              color:rgba(255,190,0,0.85);
                              font-size:10px;
                              font-weight:500;
                              text-transform:uppercase;
                              letter-spacing:0.1em;
                              margin-top:2px;
                              text-align:center;
                            ">
                              Sécurité du compte
                            </div>

                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- CONTENT -->
                  <tr>
                    <td style="padding:28px; color:#1a1a1a;">

                      <p style="margin:0 0 14px; font-size:14px; line-height:1.7; color:#2a2a2a;">
                        Bonjour,
                      </p>

                      <p style="margin:0 0 14px; font-size:14px; line-height:1.7; color:#2a2a2a;">
                        Nous avons reçu une demande de réinitialisation du mot de passe associé à votre compte
                        <strong>Tourisme Bénin</strong>.
                      </p>

                      <p style="margin:0 0 24px; font-size:14px; line-height:1.7; color:#2a2a2a;">
                        Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :
                      </p>

                      <!-- BUTTON -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding:4px 0 28px;">

                            <a href="${resetLink}"
                              target="_blank"
                              rel="noopener noreferrer"
                              style="
                                display:inline-block;
                                mso-padding-alt:0;
                                padding:13px 32px;
                                background:#008559;
                                color:#ffffff;
                                border-radius:7px;
                                text-decoration:none;
                                font-size:14px;
                                font-weight:700;
                                letter-spacing:0.04em;
                                box-shadow:0 4px 16px rgba(0,133,89,0.3);
                              ">
                              Réinitialiser mon mot de passe →
                            </a>

                          </td>
                        </tr>
                      </table>

                      <!-- WARNING -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                        <tr>
                          <td style="
                            background:rgba(255,190,0,0.12);
                            border:1px solid rgba(255,190,0,0.35);
                            border-left:4px solid #FFBE00;
                            border-radius:7px;
                            padding:12px 16px;
                          ">

                            <table role="presentation" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="vertical-align:top; padding-right:8px; font-size:16px;">
                                  ⚠️
                                </td>
                                <td style="font-size:13px; color:#0a3764; line-height:1.6;">
                                  Ce lien est valable pendant <strong>15 minutes</strong> uniquement.
                                  Après expiration, vous devrez effectuer une nouvelle demande.
                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                      </table>

                      <!-- FALLBACK -->
                      <p style="font-size:12px; color:#7a8ea8; line-height:1.6; margin:0 0 6px;">
                        Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :
                      </p>

                      <p style="
                        font-size:11px;
                        color:#0a3764;
                        word-break:break-all;
                        background:#f4f6fa;
                        padding:10px 12px;
                        border-radius:5px;
                        margin:0;
                      ">
                        ${resetLink}
                      </p>

                    </td>
                  </tr>

                  <!-- DIVIDER -->
                  <tr>
                    <td style="padding:0 28px;">
                      <div style="height:1px; background:rgba(10,55,100,0.08);"></div>
                    </td>
                  </tr>

                  <!-- FOOTER -->
                  <tr>
                    <td style="padding:18px 28px 24px; background:#fafbfd;">

                      <p style="margin:0; font-size:12px; color:#7a8ea8; line-height:1.6;">
                        Si vous n'êtes pas à l'origine de cette demande, ignorez cet email — votre mot de passe restera inchangé.
                      </p>

                      <p style="margin-top:12px; font-size:11px; color:#b0bec5;">
                        © 2026 Tourisme Bénin — Tous droits réservés
                      </p>

                    </td>
                  </tr>

                </table>
                <!-- END CARD -->

              </td>
            </tr>
          </table>

        </body>
      </html>
    `
  });
};

/**
 * Validation du compte prestataire
 */
export const validerPrestataireMail = async (toEmail, nom, prenom, password) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Validation de votre compte prestataire",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(90deg, #008751, #FCD116, #E8112D); padding: 20px; color: white; text-align: center;">
          <h2 style="margin: 0;">Tourisme Bénin</h2>
        </div>

        <!-- CONTENT -->
        <div style="padding: 20px; color: #333;">
          <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
          <p>Votre compte prestataire a été <strong style="color: #008751;">validé</strong> par l'administrateur ✅.</p>
          <p>Voici vos identifiants de connexion :</p>
          <ul style="background:#f9f9f9; padding:15px; border-radius:8px; list-style:none;">
            <li><strong>Email :</strong> ${toEmail}</li>
            <li><strong>Mot de passe provisoire :</strong> ${password}</li>
          </ul>
          <p style="color: #E8112D; font-weight: bold;">⚠️ Veuillez changer votre mot de passe lors de votre première connexion.</p>
          <p>Bienvenue parmi nous 🎉</p>
        </div>
      </div>
    `
  });
};

/**
 * Refus du compte prestataire
 */
export const refuserPrestataireMail = async (toEmail, nom, prenom, raison) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Refus de votre inscription prestataire",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(90deg, #008751, #FCD116, #E8112D); padding: 20px; color: white; text-align: center;">
          <h2 style="margin: 0;">Tourisme Bénin</h2>
        </div>

        <!-- CONTENT -->
        <div style="padding: 20px; color: #333;">
          <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
          <p>Nous vous informons que votre demande d'inscription en tant que prestataire a été <strong style="color:#E8112D;">refusée</strong>.</p>
          <p><strong>Raison :</strong> ${raison}</p>
          <p>Pour plus d'informations, merci de contacter notre support.</p>
        </div>
      </div>
    `
  });
};

/**
 * Convocation à l’entretien
 */
export const entretienPrestataireMail = async (toEmail, nom, prenom, dateEntretien, heureEntretien) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Convocation à votre entretien",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(90deg, #008751, #FCD116, #E8112D); padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 22px;">Convocation à l'entretien</h1>
        </div>

        <!-- CONTENT -->
        <div style="padding: 20px; color: #333; line-height: 1.6;">
          <p>Bonjour <strong>${prenom} ${nom}</strong>,</p>
          <p>Votre demande est actuellement en attente.  
          Nous vous invitons à passer votre entretien aux coordonnées suivantes :</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-left: 5px solid #008751; border-radius: 5px;">
            <p><strong>📅 Date :</strong> ${dateEntretien}</p>
            <p><strong>⏰ Heure :</strong> ${heureEntretien}</p>
          </div>

          <p>Merci de vous présenter à l'heure indiquée.  
          Pour toute question, contactez notre support.</p>
        </div>

        <!-- FOOTER -->
        <div style="background: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
          © ${new Date().getFullYear()} Plateforme Prestataire – Tous droits réservés.
        </div>
      </div>
    `
  });
};

/**
 * Votre de demande est en ettente
 */
export const demandeEnAttenteMail = async (prestataire, adminMessage) => {
  try {
    await transporter.sendMail({
      from: '"Plateforme Touristique" <no-reply@plateforme.com>',
      to: prestataire.email,
      subject: "Votre demande est en attente",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          
          <!-- HEADER -->
          <div style="background: linear-gradient(90deg, #008751, #FCD116, #E8112D); padding: 20px; text-align: center; color: white;">
            <h2 style="margin: 0;">Tourisme Bénin</h2>
          </div>

          <!-- CONTENT -->
          <div style="padding: 20px; color: #333;">
            <p>Bonjour <strong>${prestataire.prenom} ${prestataire.nom}</strong>,</p>
            <p>Votre demande est actuellement <strong style="color:#EAC102;">en attente</strong>.</p>
            <p>${adminMessage ? adminMessage : "Veuillez patienter pendant que l’administrateur vérifie vos informations."}</p>
            <br>
            <p style="font-size:14px; color:#555;">Cordialement,<br>L'équipe de la plateforme.</p>
          </div>
        </div>
      `,
    });
    console.log(" Mail 'Demande en attente' envoyé à :", prestataire.email);
  } catch (error) {
    console.error("Erreur lors de l’envoi du mail :", error);
  }
};

export const sendEntretienPdfMail = async (user, filePath) => {
  await transporter.sendMail({
    from: `"Support" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Convocation à l'entretien",
    text: "Veuillez trouver ci-joint votre convocation à l'entretien.",
    attachments: [
      {
        filename: "convocation_entretien.pdf",
        path: filePath,
        contentType: "application/pdf",
      },
    ],
  });
};