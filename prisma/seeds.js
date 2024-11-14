import { add, format, roundToNearestHours, sub } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

import prisma from "./db.ts";

const dateToInputDatetime = (date) => format(date, "yyyy-MM-dd'T'HH:mm");
const defaultSaltRounds = 10;

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
        "$2a$12$7IgXH7ORHd4x5O7.VC5LROJJFMq620II9ESleuMIYs.6KNDAsEYAe", // LePapier // https://bcrypt-generator.com/
      username: "LePapier",
      pseudoname: "“me”",
      firstName: "Luther",
      lastName: "Tchofo Safo",
    },
    {
      // demo / Demo
      signInEmailAddress: "demo@demo.com",
      hashedPassword:
        "$2a$12$ufrbXeZYSZYAtNAw4L.T0epcTcG5rEUDW6Vxf/hZBoycpM2FCIOcC", // demo
      username: "demo",
      pseudoname: "Demo",
      firstName: "Demetrius",
      lastName: "Moses",
    },
  ];

  const usersIds = usersData.map(() => uuidv4());
  const usersKeys = await Promise.all(
    usersIds.map(async (e) => await bcrypt.hash(e, defaultSaltRounds)),
  );

  const usersDataWithHashedKeys = usersData.map((e, i) => {
    return { ...e, id: usersIds[i], key: usersKeys[i] };
  });

  console.log({ usersDataWithHashedKeys });

  console.log(`Seeding Users...`);

  let users = [];

  console.log(`Seeding all Users...`);

  const allUsers = await Promise.all(
    usersDataWithHashedKeys.map(async (userData) => {
      return await prisma.user.upsert({
        where: {
          signInEmailAddress: userData.signInEmailAddress,
        },
        update: {},
        create: {
          id: userData.id,
          key: userData.key,
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
      name: "Présenter le projet au React Paris Meetup.",
    },
  ];
  console.log({ destinationsData });

  console.log(`Seeding Destinations...`);

  let destinations = [];

  console.log(`Seeding all Destinations...`);

  for (const user of users) {
    const destinationsIds = destinationsData.map(() => uuidv4());
    const destinationsKeys = await Promise.all(
      destinationsIds.map(async (e) => await bcrypt.hash(e, defaultSaltRounds)),
    );

    const destinationsDataWithHashedKeys = destinationsData.map((e, i) => {
      return { ...e, id: destinationsIds[i], key: destinationsKeys[i] };
    });

    const userDestinations = await Promise.all(
      destinationsDataWithHashedKeys.map(async (destinationData) => {
        return await prisma.destination.upsert({
          where: {
            name_userId: {
              name: destinationData.name,
              userId: user.id,
            },
          },
          update: {},
          create: {
            id: destinationData.id,
            key: destinationData.key,
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
      objective: "Faire un formulaire indéniable pour le projet. (passé)",
      isIndispensable: true,
      context:
        "De mon point de vue, le projet a besoin de profiter de son statut de nouveau projet pour partir sur une stack des plus actuelles afin d'avoir non seulement une longueur d'avance sur la compétition, mais aussi d'être préparé pour l'avenir. C'est donc ce que je tiens à démontrer avec cet exercice.",
      startDateAndTime: dateToInputDatetime(lastMonth),
      endDateAndTime: dateToInputDatetime(
        add(lastMonth, { minutes: momentDuration }),
      ),
    },
    {
      activity: "Développement de fonctionnalité",
      objective: "Faire un formulaire indéniable pour le projet. (actuel)",
      isIndispensable: true,
      context:
        "De mon point de vue, le projet a besoin de profiter de son statut de nouveau projet pour partir sur une stack des plus actuelles afin d'avoir non seulement une longueur d'avance sur la compétition, mais aussi d'être préparé pour l'avenir. C'est donc ce que je tiens à démontrer avec cet exercice.",
      startDateAndTime: dateToInputDatetime(nowHourFloored),
      endDateAndTime: dateToInputDatetime(
        add(nowHourFloored, { minutes: momentDuration }),
      ),
    },
    {
      activity: "Développement de fonctionnalité",
      objective: "Faire un formulaire indéniable pour le projet. (futur)",
      isIndispensable: true,
      context:
        "De mon point de vue, le projet a besoin de profiter de son statut de nouveau projet pour partir sur une stack des plus actuelles afin d'avoir non seulement une longueur d'avance sur la compétition, mais aussi d'être préparé pour l'avenir. C'est donc ce que je tiens à démontrer avec cet exercice.",
      startDateAndTime: dateToInputDatetime(nextMonth),
      endDateAndTime: dateToInputDatetime(
        add(nextMonth, { minutes: momentDuration }),
      ),
    },
  ];
  console.log({ momentsData });

  console.log(`Seeding Moments...`);

  let moments = [];

  console.log(`Seeding all Moments...`);

  for (const user of users) {
    const userDestinations = destinations.filter((e) => e.userId === user.id);
    for (const destination of userDestinations) {
      const momentsIds = momentsData.map(() => uuidv4());
      const momentsKeys = await Promise.all(
        momentsIds.map(async (e) => await bcrypt.hash(e, defaultSaltRounds)),
      );

      const momentsDataWithHashedKeys = momentsData.map((e, i) => {
        return { ...e, id: momentsIds[i], key: momentsKeys[i] };
      });

      const destinationMoments = await Promise.all(
        momentsDataWithHashedKeys.map(async (momentData) => {
          return await prisma.moment.upsert({
            where: {
              name_userId: {
                name: momentData.objective,
                userId: user.id,
              },
            },
            update: {},
            create: {
              id: momentData.id,
              key: momentData.key,
              activity: momentData.activity,
              name: momentData.objective,
              isIndispensable: momentData.isIndispensable,
              description: momentData.context,
              startDateAndTime: momentData.startDateAndTime,
              duration: momentDuration.toString(),
              endDateAndTime: momentData.endDateAndTime,
              destinationId: destination.id,
              userId: user.id,
            },
          });
        }),
      );

      moments = moments.concat(destinationMoments);
    }
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

  let steps = [];

  console.log(`Seeding all Steps...`);

  for (const moment of moments) {
    // keeping the map because makeStepsCompoundDurationsArray isn't tailored for this
    const map = new Map();
    let durationTotal = 0;
    for (let j = 0; j < stepsData.length; j++) {
      durationTotal += +stepsData[j].duration;
      map.set(j, durationTotal);
    }

    const stepsIds = stepsData.map(() => uuidv4());
    const stepsKeys = await Promise.all(
      stepsIds.map(async (e) => await bcrypt.hash(e, defaultSaltRounds)),
    );

    const stepsDataWithHashedKeys = stepsData.map((e, i) => {
      return { ...e, id: stepsIds[i], key: stepsKeys[i] };
    });

    const momentSteps = await Promise.all(
      stepsDataWithHashedKeys.map(async (stepData, index) => {
        return await prisma.step.upsert({
          where: {
            name_momentId: {
              name: stepData.title,
              momentId: moment.id,
            },
          },
          update: {},
          create: {
            id: stepData.id,
            key: stepData.key,
            orderId: stepData.orderId,
            name: stepData.title,
            description: stepData.details,
            startDateAndTime:
              index === 0
                ? moment.startDateAndTime
                : dateToInputDatetime(
                    add(moment.startDateAndTime, {
                      minutes: map.get(index - 1),
                    }),
                  ),
            duration: stepData.duration,
            endDateAndTime: dateToInputDatetime(
              add(moment.startDateAndTime, {
                minutes: map.get(index),
              }),
            ),
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
rm ./prisma/dev.db
npx prisma db push
npx prisma db seed

"type": "module",

"prisma": {
  "seed": "node --loader ts-node/esm prisma/seeds.js"
}
npx prisma db seed

npx prisma studio
*/
