import { User, Destination, Moment, Step } from "@prisma/client";
import { add, format, roundToNearestHours, sub } from "date-fns";

import prisma from "./db";
import { endDateAndTime } from "@/app/utilities/moments";

const dateToInputDatetime = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");

async function seed() {
  console.log(`Defining time.`);
  const now = new Date();

  const nowHourFloored = roundToNearestHours(now, { roundingMethod: "floor" });
  const lastMonth = sub(nowHourFloored, { months: 1 });
  const nextMonth = add(nowHourFloored, { months: 1 });

  console.log(`Defining step durations.`);
  const stepDuration1 = 60;
  const stepDuration2 = 120;
  const stepDuration3 = 180;
  const momentDuration = stepDuration1 + stepDuration2 + stepDuration3;

  console.log(`Beginning initial seeds...`);

  ///////////////////////////////////////////////////////////////////////////

  console.log(`Creating users data.`);
  const usersData = [
    {
      // LePapier / “me”
      signInEmailAddress: "l@l.me",
      hashedPassword:
        "$2a$12$7IgXH7ORHd4x5O7.VC5LROJJFMq620II9ESleuMIYs.6KNDAsEYAe", // LePapier
      username: "LePapier",
      pseudoname: "“me”",
      firstName: "Luther",
      lastName: "Tchofo Safo",
    },
  ];
  console.log({ usersData });

  console.log(`Seeding Users...`);

  let users: User[] = [];

  console.log(`Seeding all Users...`);

  const allUsers = await Promise.all(
    usersData.map(async (userData) => {
      return await prisma.user.upsert({
        where: {
          signInEmailAddress: userData.signInEmailAddress,
        },
        update: {},
        create: {
          signInEmailAddress: userData.signInEmailAddress,
          hashedPassword: userData.hashedPassword,
          username: userData.username,
          pseudoname: userData.pseudoname,
          firstName: userData.firstName,
          lastName: userData.lastName,
        },
      });
    }),
  );

  users = users.concat(allUsers);

  console.log(`...All Users seeded.`);

  console.log({ users });

  console.log(`...Users seeded.`);

  ///////////////////////////////////////////////////////////////////////////

  console.log(`Creating destinations data.`);
  const destinationsData = [
    {
      name: "Devenir tech lead sur TekTIME.",
    },
  ];
  console.log({ destinationsData });

  console.log(`Seeding Destinations...`);

  let destinations: Destination[] = [];

  console.log(`Seeding all Destinations...`);

  for (const user of users) {
    const userDestinations = await Promise.all(
      destinationsData.map(async (destinationData) => {
        return await prisma.destination.upsert({
          where: {
            name_userId: {
              name: destinationData.name,
              userId: user.id,
            },
          },
          update: {},
          create: {
            name: destinationData.name,
            userId: user.id,
          },
        });
      }),
    );

    destinations = destinations.concat(userDestinations);
  }

  console.log(`...All Destinations seeded.`);

  console.log({ destinations });

  console.log(`...Destinations seeded.`);

  ///////////////////////////////////////////////////////////////////////////

  console.log(`Creating moments data.`);
  const momentsData = [
    {
      activity: "Développement de fonctionnalité",
      objective: "Faire un formulaire indéniable pour TekTIME. (passé)",
      isIndispensable: true,
      context:
        "De mon point de vue, TekTIME a besoin de profiter de son statut de nouveau projet pour partir sur une stack des plus actuelles afin d'avoir non seulement une longueur d'avance sur la compétition, mais aussi d'être préparé pour l'avenir. C'est donc ce que je tiens à démontrer avec cet exercice.",
      dateAndTime: dateToInputDatetime(lastMonth),
      endDateAndTime: dateToInputDatetime(
        add(lastMonth, { minutes: momentDuration }),
      ),
    },
    {
      activity: "Développement de fonctionnalité",
      objective: "Faire un formulaire indéniable pour TekTIME. (actuel)",
      isIndispensable: true,
      context:
        "De mon point de vue, TekTIME a besoin de profiter de son statut de nouveau projet pour partir sur une stack des plus actuelles afin d'avoir non seulement une longueur d'avance sur la compétition, mais aussi d'être préparé pour l'avenir. C'est donc ce que je tiens à démontrer avec cet exercice.",
      dateAndTime: dateToInputDatetime(nowHourFloored),
      endDateAndTime: dateToInputDatetime(
        add(nowHourFloored, { minutes: momentDuration }),
      ),
    },
    {
      activity: "Développement de fonctionnalité",
      objective: "Faire un formulaire indéniable pour TekTIME. (futur)",
      isIndispensable: true,
      context:
        "De mon point de vue, TekTIME a besoin de profiter de son statut de nouveau projet pour partir sur une stack des plus actuelles afin d'avoir non seulement une longueur d'avance sur la compétition, mais aussi d'être préparé pour l'avenir. C'est donc ce que je tiens à démontrer avec cet exercice.",
      dateAndTime: dateToInputDatetime(nextMonth),
      endDateAndTime: dateToInputDatetime(
        add(nextMonth, { minutes: momentDuration }),
      ),
    },
  ];
  console.log({ momentsData });

  console.log(`Seeding Moments...`);

  let moments: Moment[] = [];

  console.log(`Seeding all Moments...`);

  for (const destination of destinations) {
    const destinationMoments = await Promise.all(
      momentsData.map(async (momentData) => {
        return await prisma.moment.upsert({
          where: {
            name_destinationId: {
              name: momentData.objective,
              destinationId: destination.id,
            },
          },
          update: {},
          create: {
            activity: momentData.activity,
            name: momentData.objective,
            isIndispensable: momentData.isIndispensable,
            description: momentData.context,
            dateAndTime: momentData.dateAndTime,
            destinationId: destination.id,
          },
        });
      }),
    );

    moments = moments.concat(destinationMoments);
  }

  console.log(`...All Moments seeded.`);

  console.log({ moments });

  console.log(`...Moments seeded.`);

  ///////////////////////////////////////////////////////////////////////////

  console.log(`Creating steps data.`);
  const stepsData = [
    {
      orderId: 1,
      title: "Réaliser la div d'une étape",
      details:
        "S'assurer que chaque étape ait un format qui lui correspond, en l'occurrence en rapport avec le style de la création d'étape.",
      duration: stepDuration1.toString(),
    },
    {
      orderId: 2,
      title: "Implémenter le système de coulissement des étapes",
      details:
        "Alors, ça c'est plus pour la fin mais, il s'agit d'utiliser Framer Motion et son composant Reorder pour pouvoir réorganiser les étapes, et même visiblement en changer l'ordre.",
      duration: stepDuration2.toString(),
    },
    {
      orderId: 3,
      title: "Finir de vérifier le formulaire",
      details:
        "S'assurer que toutes les fonctionnalités marchent sans problèmes, avant une future phase de nettoyage de code et de mises en composants.",
      duration: stepDuration3.toString(),
    },
  ];
  console.log({ stepsData });

  console.log(`Seeding Steps...`);

  let steps: Step[] = [];

  console.log(`Seeding all Steps...`);

  for (const moment of moments) {
    const momentSteps = await Promise.all(
      stepsData.map(async (stepData) => {
        return await prisma.step.upsert({
          where: {
            name_momentId: {
              name: stepData.title,
              momentId: moment.id,
            },
          },
          update: {},
          create: {
            orderId: stepData.orderId,
            name: stepData.title,
            description: stepData.details,
            duration: stepData.duration,
            momentId: moment.id,
          },
        });
      }),
    );

    steps = steps.concat(momentSteps);
  }

  console.log(`...All Steps seeded.`);

  console.log({ steps });

  console.log(`...Steps seeded.`);
}

seed();

/* Notes
For now since there's only one test User and their only one test Destination and its only one test Moment and its Steps, I'm simplifying the seeds process to have all parent models have the exact same child data.
Then as this evolves, it's at the heart of this logic that I'll be able to specify which child data is supposed to be assigned to which parent respectively.
*/
