import transporter from "../config/mail.config.js";

/**
 * Réinitialisation du mot de passe
 */
export const sendResetPasswordEmail = async (toEmail, resetLink) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: toEmail,
    subject: "Réinitialisation de votre mot de passe",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        
        <!-- HEADER -->
        <div style="background: linear-gradient(90deg, #008751, #FCD116, #E8112D); padding: 20px; color: white; text-align: center;">
          <h2 style="margin: 0;">Tourisme Bénin</h2>
        </div>

        <!-- CONTENT -->
        <div style="padding: 20px; color: #333;">
          <p>Bonjour,</p>
          <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
          <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #008751; color: white; border-radius: 5px; text-decoration: none; margin: 10px 0;">Réinitialiser mon mot de passe</a>
          <p>⚠️ Ce lien expire dans <strong>1 heure</strong>.</p>
        </div>

      </div>
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