import PDFDocument from "pdfkit";
import fs from "fs";

export const generateEntretienPdf = (user, dateEntretien, heureEntretien, filePath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument();
            const stream = fs.createWriteStream(filePath);
            doc.pipe(stream);

            // Titre
            doc.fontSize(20).text("Convocation à l'entretien", { align: "center" });
            doc.moveDown();

            // Contenu
            doc.fontSize(14).text(`Nom: ${user.nom}`);
            doc.text(`Prénom: ${user.prenom}`);
            doc.text(`Date de l'entretien: ${dateEntretien}`);
            doc.text(`Heure de l'entretien: ${heureEntretien}`);
            doc.moveDown();
            doc.text("Merci de vous présenter à l'heure indiquée.", { align: "left" });

            doc.end();

            stream.on("finish", () => resolve(filePath));
            stream.on("error", reject);
        } catch (err) {
            reject(err);
        }
    });
};