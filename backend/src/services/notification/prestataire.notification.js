import { sendEmail } from "./email.service.js";
import { generateEntretienPdf } from "../../utils/pdf.js";
import { sendEntretienPdfMail } from "../../utils/sendMail.js";
import fs from "fs";
import path from "path";

/**
 * Email de confirmation de réception de la demande
 */
export const sendPrestatairePendingNotification = async (prestataire) => {
  await sendEmail({
    to: prestataire.email,
    subject: "Votre demande d'inscription est reçue — Tourisme Bénin",
    html: `
      <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
      <body style="margin:0;padding:0;background:#f4f6fa;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:40px 16px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(10,55,100,0.12);">
              <tr><td style="background:#0a3764;padding:0;">
                <div style="height:3px;background:linear-gradient(90deg,#FFBE00,#e6aa00);"></div>
                <div style="padding:20px 28px;color:#fff;">
                  <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Tourisme Bénin</div>
                  <div style="font-size:10px;color:rgba(255,190,0,.85);text-transform:uppercase;letter-spacing:.1em;margin-top:2px;">Gestion des prestataires</div>
                </div>
              </td></tr>
              <tr><td style="padding:28px;color:#1a1a1a;">
                <p style="margin:0 0 14px;font-size:14px;line-height:1.7;">Bonjour <strong>${prestataire.prenom} ${prestataire.nom}</strong>,</p>
                <p style="margin:0 0 14px;font-size:14px;line-height:1.7;">
                  Nous avons bien reçu votre demande d'inscription en tant que prestataire sur la plateforme <strong>Tourisme Bénin</strong>.
                </p>
                <p style="margin:0 0 24px;font-size:14px;line-height:1.7;">
                  Votre dossier est en cours d'examen. Vous serez notifié par email à chaque étape du processus.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="background:rgba(255,190,0,.10);border:1px solid rgba(255,190,0,.3);border-left:4px solid #FFBE00;border-radius:7px;padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#0a3764;line-height:1.6;">
                      ⏳ Délai de traitement habituel : <strong>48 à 72 heures ouvrées</strong>.
                    </p>
                  </td></tr>
                </table>
              </td></tr>
              <tr><td style="padding:16px 28px 20px;background:#fafbfd;">
                <p style="margin:0;font-size:11px;color:#b0bec5;">© 2026 Tourisme Bénin — Tous droits réservés</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `
  });
};

/**
 * Email de convocation à l'entretien + PDF en pièce jointe
 */
export const sendPrestataireInterviewNotification = async (
  prestataire, dateEntretien, heureEntretien
) => {
  const fileName = `convocation_${prestataire.id_prestataire}.pdf`;
  const filePath = path.join("uploads", "convocations", fileName);

  // Créer le dossier si absent
  fs.mkdirSync(path.dirname(filePath), { recursive: true });

  // Générer le PDF
  await generateEntretienPdf(prestataire.user, dateEntretien, heureEntretien, filePath);

  // Envoyer l'email avec pièce jointe
  await sendEmail({
    to: prestataire.user.email,
    subject: "Convocation à votre entretien — Tourisme Bénin",
    html: `
      <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
      <body style="margin:0;padding:0;background:#f4f6fa;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:40px 16px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(10,55,100,0.12);">
              <tr><td style="background:#0a3764;padding:0;">
                <div style="height:3px;background:linear-gradient(90deg,#FFBE00,#e6aa00);"></div>
                <div style="padding:20px 28px;color:#fff;">
                  <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Tourisme Bénin</div>
                  <div style="font-size:10px;color:rgba(255,190,0,.85);text-transform:uppercase;letter-spacing:.1em;margin-top:2px;">Convocation entretien</div>
                </div>
              </td></tr>
              <tr><td style="padding:28px;color:#1a1a1a;">
                <p style="margin:0 0 14px;font-size:14px;line-height:1.7;">Bonjour <strong>${prestataire.user.prenom} ${prestataire.user.nom}</strong>,</p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.7;">
                  Suite à l'examen de votre dossier, nous vous convions à un entretien aux coordonnées suivantes :
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr><td style="background:#f4f6fa;border-left:4px solid #0a3764;border-radius:7px;padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:14px;color:#0a3764;"><strong>📅 Date :</strong> ${dateEntretien}</p>
                    <p style="margin:0;font-size:14px;color:#0a3764;"><strong>⏰ Heure :</strong> ${heureEntretien}</p>
                  </td></tr>
                </table>
                <p style="margin:0;font-size:13px;color:#7a8595;line-height:1.6;">
                  Votre convocation officielle est jointe à cet email en PDF.
                </p>
              </td></tr>
              <tr><td style="padding:16px 28px 20px;background:#fafbfd;">
                <p style="margin:0;font-size:11px;color:#b0bec5;">© 2026 Tourisme Bénin — Tous droits réservés</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `,
    attachments: [
      { filename: "convocation_entretien.pdf", path: filePath, contentType: "application/pdf" }
    ]
  });

  // Nettoyer le fichier PDF temporaire
  fs.unlink(filePath, (err) => {
    if (err) console.error("Erreur suppression PDF :", err);
  });
};

/**
 * Email de validation du compte
 */
export const sendPrestataireValidatedNotification = async (
  prestataire, tempPassword
) => {
  await sendEmail({
    to: prestataire.user.email,
    subject: "Votre compte prestataire est activé — Tourisme Bénin",
    html: `
      <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
      <body style="margin:0;padding:0;background:#f4f6fa;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:40px 16px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(10,55,100,0.12);">
              <tr><td style="background:#0a3764;padding:0;">
                <div style="height:3px;background:linear-gradient(90deg,#FFBE00,#e6aa00);"></div>
                <div style="padding:20px 28px;color:#fff;">
                  <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Tourisme Bénin</div>
                  <div style="font-size:10px;color:rgba(255,190,0,.85);text-transform:uppercase;letter-spacing:.1em;margin-top:2px;">Compte activé ✅</div>
                </div>
              </td></tr>
              <tr><td style="padding:28px;color:#1a1a1a;">
                <p style="margin:0 0 14px;font-size:14px;line-height:1.7;">Bonjour <strong>${prestataire.user.prenom} ${prestataire.user.nom}</strong>,</p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.7;">
                  Félicitations 🎉 Votre compte prestataire a été <strong style="color:#008559;">validé</strong>.
                  Voici vos identifiants de première connexion :
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr><td style="background:#f4f6fa;border-left:4px solid #008559;border-radius:7px;padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:14px;"><strong>📧 Email :</strong> ${prestataire.user.email}</p>
                    <p style="margin:0;font-size:14px;"><strong>🔑 Mot de passe temporaire :</strong> <code style="background:#fff;padding:2px 8px;border-radius:4px;border:1px solid #e2e6ec;">${tempPassword}</code></p>
                  </td></tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr><td style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-left:4px solid #ef4444;border-radius:7px;padding:12px 16px;">
                    <p style="margin:0;font-size:13px;color:#b91c1c;line-height:1.6;">
                      ⚠️ Ce mot de passe est <strong>temporaire</strong>. Vous serez invité à le modifier lors de votre première connexion.
                    </p>
                  </td></tr>
                </table>
              </td></tr>
              <tr><td style="padding:16px 28px 20px;background:#fafbfd;">
                <p style="margin:0;font-size:11px;color:#b0bec5;">© 2026 Tourisme Bénin — Tous droits réservés</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `
  });
};

/**
 * Email de refus
 */
export const sendPrestataireRejectedNotification = async (
  prestataire, raison = "Dossier incomplet ou non conforme."
) => {
  await sendEmail({
    to: prestataire.user.email,
    subject: "Résultat de votre demande prestataire — Tourisme Bénin",
    html: `
      <!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/></head>
      <body style="margin:0;padding:0;background:#f4f6fa;font-family:'Helvetica Neue',Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fa;padding:40px 16px;">
          <tr><td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="max-width:580px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(10,55,100,0.12);">
              <tr><td style="background:#0a3764;padding:0;">
                <div style="height:3px;background:linear-gradient(90deg,#FFBE00,#e6aa00);"></div>
                <div style="padding:20px 28px;color:#fff;">
                  <div style="font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Tourisme Bénin</div>
                  <div style="font-size:10px;color:rgba(255,190,0,.85);text-transform:uppercase;letter-spacing:.1em;margin-top:2px;">Résultat de votre demande</div>
                </div>
              </td></tr>
              <tr><td style="padding:28px;color:#1a1a1a;">
                <p style="margin:0 0 14px;font-size:14px;line-height:1.7;">Bonjour <strong>${prestataire.user.prenom} ${prestataire.user.nom}</strong>,</p>
                <p style="margin:0 0 20px;font-size:14px;line-height:1.7;">
                  Après examen de votre dossier, nous regrettons de vous informer que votre demande d'inscription
                  en tant que prestataire a été <strong style="color:#ef4444;">refusée</strong>.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                  <tr><td style="background:#fff5f5;border:1px solid rgba(239,68,68,.2);border-left:4px solid #ef4444;border-radius:7px;padding:14px 16px;">
                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#ef4444;text-transform:uppercase;letter-spacing:.05em;">Motif</p>
                    <p style="margin:0;font-size:14px;color:#1a1a1a;line-height:1.6;">${raison}</p>
                  </td></tr>
                </table>
                <p style="margin:0;font-size:13px;color:#7a8595;line-height:1.6;">
                  Pour toute question, contactez notre support à <a href="mailto:support@tourisme-benin.bj" style="color:#0a3764;">support@tourisme-benin.bj</a>.
                </p>
              </td></tr>
              <tr><td style="padding:16px 28px 20px;background:#fafbfd;">
                <p style="margin:0;font-size:11px;color:#b0bec5;">© 2026 Tourisme Bénin — Tous droits réservés</p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body></html>
    `
  });
};