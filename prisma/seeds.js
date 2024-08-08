import prisma from "./db.ts";

async function seed() {
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

  let users = [];

  console.log(`Seeding all Users...`);

  usersData.map(async (userData) => {
    return users.push(
      await prisma.user.upsert({
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
      }),
    );
  }),
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

  let destinations = [];

  console.log(`Seeding all Destinations...`);

  for (const user of users) {
    destinationsData.map(async (destinationData) => {
      return destinations.push(
        await prisma.destination.upsert({
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
        }),
      );
    });
  }

  console.log(`...All Destinations seeded.`);

  console.log({ destinations });

  console.log(`...Destinations seeded.`);

  ///////////////////////////////////////////////////////////////////////////

  console.log(`Creating moments data.`);
  const momentsData = [
    {
      activity: "Développement de fonctionnalité",
      objective: "Devenir tech lead sur TekTIME.",
      isIndispensable: true,
      context:
        "De mon point de vue, TekTIME a besoin de profiter de son statut de nouveau projet pour partir sur une stack des plus actuelles afin d'avoir non seulement une longueur d'avance sur la compétition, mais aussi d'être préparé pour l'avenir. C'est donc ce que je tiens à démontrer avec cet exercice.",
      dateAndTime: "2024-10-12T14:30",
    },
  ];
  console.log({ momentsData });

  console.log(`Seeding Moments...`);

  let moments = [];

  console.log(`Seeding all Moments...`);

  for (const destination of destinations) {
    momentsData.map(async (momentData) => {
      return moments.push(
        await prisma.moment.upsert({
          where: {
            objective_destinationId: {
              objective: momentData.objective,
              destinationId: destination.id,
            },
          },
          update: {},
          create: {
            activity: momentData.activity,
            objective: momentData.objective,
            isIndispensable: momentData.isIndispensable,
            context: momentData.context,
            dateAndTime: momentData.dateAndTime,
            destinationId: destination.id,
          },
        }),
      );
    });
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
      duration: "10",
    },
    {
      orderId: 2,
      title: "Implémenter le système de coulissement des étapes",
      details:
        "Alors, ça c'est plus pour la fin mais, il s'agit d'utiliser Framer Motion et son composant Reorder pour pouvoir réorganiser les étapes, et même visiblement en changer l'ordre.",
      duration: "20",
    },
    {
      orderId: 3,
      title: "Finir de vérifier le formulaire",
      details:
        "S'assurer que toutes les fonctionnalités marchent sans problèmes, avant une future phase de nettoyage de code et de mises en composants.",
      duration: "30",
    },
  ];
  console.log({ stepsData });

  console.log(`Seeding Steps...`);

  let steps = [];

  console.log(`Seeding all Steps...`);

  for (const moment of moments) {
    stepsData.map(async (stepData) => {
      return steps.push(
        await prisma.step.upsert({
          where: {
            title_momentId: {
              title: stepData.title,
              momentId: moment.id,
            },
          },
          update: {},
          create: {
            orderId: stepData.orderId,
            title: stepData.title,
            details: stepData.details,
            duration: stepData.duration,
            momentId: moment.id,
          },
        }),
      );
    });
  }

  console.log(`...All Steps seeded.`);
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
*/
