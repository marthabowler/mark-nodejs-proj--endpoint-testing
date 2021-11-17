import supertest from "supertest";
import app from "./server";
import {
  MYSTERIOUS_ROBED_FIGURE,
  ADVENTURE_ADMIN,
} from "./constants/characters";
import { CAVE_EXTERIOR, HANDFORTH_PARISH_COUNCIL } from "./constants/locations";

test("GET /help responds with an end of adventure", async () => {
  const response = await supertest(app).get("/help");
  expect(response.body).toStrictEqual({
    location: HANDFORTH_PARISH_COUNCIL,
    speech: {
      speaker: ADVENTURE_ADMIN,
      text: "This is the endpoint adventure! It's based on the classic 'choose your own adventure' books of ye olden 20th century times. When you visit an endpoint, you're presented with a scene and some text, and then you have a few options to choose from - your simulate turning to a new page by hitting a new endpoint.",
    },
    options: {
      backToStart: "/",
    },
  });
});

test("GET / responds with a welcome message from our mysterious robed figure", async () => {
  const response = await supertest(app).get("/");

  expect(response.body).toStrictEqual({
    location: CAVE_EXTERIOR,
    speech: {
      speaker: MYSTERIOUS_ROBED_FIGURE,
      text: "Welcome, young adventurer, to the ENDPOINT ADVENTURE. Are you ready for this quest?",
    },
    options: {
      yes: "/quest/accept",
      no: "/quest/decline",
      help: "/help",
    },
  });
});

test("GET /quest/accept has our mysterious robed figure give a couple of further choices", async () => {
  const response = await supertest(app).get("/quest/accept");

  // check the speaker and location are right
  expect(response.body).toMatchObject({
    location: CAVE_EXTERIOR,
    speech: {
      speaker: MYSTERIOUS_ROBED_FIGURE,
    },
  });

  // check the robed figure is saying something
  expect(typeof response.body.speech.text).toBe("string");

  // check that there are at least two further options
  expect(Object.keys(response.body.options).length).toBeGreaterThanOrEqual(2);
});

test("GET /quest/decline responds with an apocalyptic message", async () => {
  const response = await supertest(app).get("/quest/decline");

  // located in the apocalypse
  expect(response.body.location).toBe("Apocalypse");

  // aggro speaker
  expect(response.body.speech.speaker.name).toBe("Titan, Destroyer of Worlds");

  // some aggro message
  expect(response.body.speech.text).toMatch("FOOL");
  expect(response.body.speech.text).toMatch(/mistake/i);

  // only includes the option to restart
  expect(response.body.options).toStrictEqual({ restart: "/" });
});

test("GET /quest/start/impossible responds with world war two scenario", async () => {
  const response = await supertest(app).get("/quest/start/impossible");

  // there is _some_ location
  expect(response.body.location).toBe("World War II");

  // there is _some_ speaker
  expect(response.body.speech.speaker.name).toMatch(/hitler/i);

  // fiery death
  expect(response.body.speech.text).toMatch(/fireball/i);
  expect(response.body.speech.text).toMatch(/dragon/i);
  expect(response.body.speech.text).toMatch(/excruciating/i);

  // includes option to restart
  expect(response.body.options).toMatchObject({ restart: "/" });
});

test("GET /quest/start/easy responds with the option to kill King Triton", async () => {
  const response = await supertest(app).get("/quest/start/easy");

  expect(response.body).toStrictEqual({
    location: "Under the sea",
    speech: {
      speaker: "King Triton",
      description: "An old merman with a long white beard",
      text: "If you want to MARRY MY DAUGHTER you will have to kill me!",
    },
    options: {
      killTriton: "/quest/start/easy/killtriton",
      restart: "/",
    },
  });

  expect(response.body.speech.text).toMatch(/marry/i);
  expect(response.body.speech.text).toMatch(/daughter/i);

  expect(response.body.options).toMatchObject({
    killTriton: "/quest/start/easy/killtriton",
  });
});
