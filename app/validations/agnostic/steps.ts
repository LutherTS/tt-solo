// "use agnostic";
// Proposes "use agnostic" to enforce an Agnostic Module.

/* IMPORTS */

// External imports

import { z } from "zod";

/* LOGIC */

// expected to be always plural
const DEFAULT_STRING_MININUM = 3;
const DEFAULT_STRING_MAXIMUM = 200;

const DESCRIPTION_STRING_MAXIMUM = 900;

const StepSchema = z.object({
  stepId: z.string().uuid(),
  stepOrderId: z.number(),
  stepName: z
    .string({
      invalid_type_error: "Veuillez écrire un intitulé.",
    })
    .min(DEFAULT_STRING_MININUM, {
      message: `Votre intitulé doit faire un minimum de ${DEFAULT_STRING_MININUM} caractères.`,
    })
    .max(DEFAULT_STRING_MAXIMUM, {
      message: `Votre intitulé doit faire un maximum de ${DEFAULT_STRING_MAXIMUM} caractères.`,
    }),
  stepDescription: z
    .string({
      invalid_type_error: "Veuillez écrire des détails.",
    })
    .min(DEFAULT_STRING_MININUM, {
      message: `Vos détails doivent faire un minimum de ${DEFAULT_STRING_MININUM} caractères.`,
    })
    .max(DESCRIPTION_STRING_MAXIMUM, {
      message: `Vos détails doivent doit faire un maximum de ${DESCRIPTION_STRING_MAXIMUM} caractères.`,
    }),
  stepStartDateAndTime: z.string(),
  stepDuration: z.string(),
  stepEndDateAndTime: z.string(),
  stepCreatedAt: z.string().datetime(),
  stepUpdatedAt: z.string().datetime(),
  momentId: z.string().uuid(),
  // extra
  realStepDuration: z
    .number({
      invalid_type_error: "Veuillez saisir un nombre.",
    })
    .multipleOf(1, {
      message: "Veuillez saisir un entier.",
    })
    .min(5, {
      message: "Votre étape doit durer un minimum de 5 minutes.",
    })
    .max(60 * 24, {
      message: "Votre étape ne peux pas durer plus de 24 heures.",
    }),
  eventStepDuration: z
    .number({
      invalid_type_error: "Vous ne pouvez que saisir un nombre.",
    })
    .multipleOf(1, {
      message: "Vous ne pouvez que saisir un entier.",
    })
    .nonnegative({
      message: "Vous ne pouvez que saisir un nombre nul ou positif.",
    })
    .max(
      1440, // 60 * 24
      {
        message:
          "Vous ne pouvez que saisir un nombre de minutes inférieur à 24 heures.",
      },
    ),
});

export const CreateOrUpdateStepSchema = StepSchema.pick({
  stepName: true,
  stepDescription: true,
  realStepDuration: true,
});

export const EventStepDurationSchema = StepSchema.pick({
  eventStepDuration: true,
});
