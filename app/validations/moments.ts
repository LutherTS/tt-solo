import { z } from "zod";

// expected to be always plural
const DEFAULT_STRING_MININUM = 3;
const DEFAULT_STRING_MAXIMUM = 200;

const DESCRIPTION_STRING_MAXIMUM = 900;

const MomentSchema = z.object({
  // the insistence on momentId, etc. was due to the default names risking conflicts in the actions
  momentId: z.string().uuid(),
  momentActivity: z
    .string({
      invalid_type_error: "Veuillez écrire ou sélectionner une activité.",
    })
    .min(DEFAULT_STRING_MININUM, {
      message: `Votre activité doit faire un minimum de ${DEFAULT_STRING_MININUM} caractères.`,
    })
    .max(DEFAULT_STRING_MAXIMUM, {
      message: `Votre activité doit faire un maximum de ${DEFAULT_STRING_MAXIMUM} caractères.`,
    }),
  momentName: z
    .string({
      invalid_type_error: "Veuillez écrire un objectif.",
    })
    .min(DEFAULT_STRING_MININUM, {
      message: `Votre objectif doit faire un minimum de ${DEFAULT_STRING_MININUM} caractères.`,
    })
    .max(DEFAULT_STRING_MAXIMUM, {
      message: `Votre objectif doit faire un maximum de ${DEFAULT_STRING_MAXIMUM} caractères.`,
    })
    .regex(/^[^_]*$/, {
      message: "Votre objectif ne doit pas contenir de tiret bas (_).",
    }),
  momentIsIndispensable: z.boolean({
    invalid_type_error:
      "Veuillez activer ou désactiver l'interrupteur d'indispensabilité.",
  }),
  momentDescription: z
    .string({
      invalid_type_error: "Veuillez écrire un contexte.",
    })
    .min(DEFAULT_STRING_MININUM, {
      message: `Votre contexte doit faire un minimum de ${DEFAULT_STRING_MININUM} caractères.`,
    })
    .max(DESCRIPTION_STRING_MAXIMUM, {
      message: `Votre contexte doit faire un maximum de ${DESCRIPTION_STRING_MAXIMUM} caractères.`,
    }),
  momentStartDateAndTime: z.string({
    invalid_type_error:
      "Veuillez déterminer une date et une heure de début de votre moment.",
  }),
  momentDuration: z.string({
    invalid_type_error:
      "Interne : la durée du moment n'a pas été correctement gérée.",
  }),
  momentEndDateAndTime: z.string({
    invalid_type_error:
      "Interne : la date et l'heure de fin du moment n'ont pas été correctement gérées.",
  }),
  momentCreatedAt: z.string().datetime(),
  momentUpdatedAt: z.string().datetime(),
  destinationId: z.string().uuid(),
  userId: z.string().uuid(),
  // extras
  destinationName: z
    .string({
      invalid_type_error: "Veuillez écrire/sélectionner une destination.",
    })
    .min(DEFAULT_STRING_MININUM, {
      message: `Votre destination doit faire un minimum de ${DEFAULT_STRING_MININUM} caractères.`,
    })
    .max(DEFAULT_STRING_MAXIMUM, {
      message: `Votre destination doit faire un maximum de ${DEFAULT_STRING_MAXIMUM} caractères.`,
    }),
});

export const CreateOrUpdateMomentSchema = MomentSchema.pick({
  destinationName: true,
  momentActivity: true,
  momentName: true,
  momentIsIndispensable: true,
  momentDescription: true,
  momentStartDateAndTime: true,
});
