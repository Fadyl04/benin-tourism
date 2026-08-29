import prisma from '../../config/db.config.js';
import bcrypt from 'bcrypt';
/**
 * Inscription / demande prestataire
 */
export const registerPrestataireService = async (data) => {

    const {
        nom,
        prenom,
        email,
        password,
        type,
        genre,
        date_naissance,
        adresse,
        ville,
        telephone,
        annee_experience,
        document_justificatif,
        image
    }=data;


    try {
        const existingUser = await prisma.user.findUnique({
            where:{email}
        });

        if(existingUser){
            throw new Error(
                "Email déjà utilisé"
            );
        }
        const existingPhone = await prisma.prestataire.findFirst({
            where:{telephone}
        });
        if(existingPhone){
            throw new Error(
                "Numéro de téléphone déjà utilisé"
            );
        }
        if(!date_naissance){
            throw new Error(
                "Date de naissance obligatoire"
            );
        }
        const hashedPassword =await bcrypt.hash(password,12);
        const newUser = await prisma.user.create({

            data:{
                nom:nom.trim(),
                prenom:prenom.trim(),
                email:email.toLowerCase().trim(),
                password:hashedPassword,
                role:"prestataire",
                firstLogin:true,
                prestataire:{

                    create:{
                        type,
                        genre,
                        date_naissance:new Date(date_naissance),
                        adresse:adresse?.trim(),
                        ville:ville?.trim(),
                        telephone: telephone.trim(),
                        annee_experience: Number(annee_experience),
                        document_justificatif:document_justificatif || null,
                        statut_validation: "en_attente",
                        statut:"inactif",
                        image:image || null
                    }
                }
            },
            include:{
                prestataire:true
            }

        });



        const {password: removedPassword, ...userWithoutPassword}=newUser;
        return userWithoutPassword;



    }catch(error){
        console.error("registerPrestataireService:", error);
        if(error.code==="P2002"){
            throw new Error( "Une information existe déjà");
        }
        throw error;


    }


};