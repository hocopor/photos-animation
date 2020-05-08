import "./styles.css";

const photosContainer = document.querySelector(".photos");

const fragment = document.createDocumentFragment();

const photos = [
  "https://randomuser.me/api/portraits/med/women/86.jpg",
  "https://randomuser.me/api/portraits/med/men/5.jpg",
  "https://randomuser.me/api/portraits/med/men/57.jpg",
  "https://randomuser.me/api/portraits/med/men/48.jpg",
  "https://randomuser.me/api/portraits/med/women/65.jpg",
  "https://randomuser.me/api/portraits/med/women/96.jpg",
  "https://randomuser.me/api/portraits/med/women/45.jpg",
  "https://randomuser.me/api/portraits/med/men/72.jpg",
  "https://randomuser.me/api/portraits/med/women/39.jpg",
  "https://randomuser.me/api/portraits/med/women/31.jpg",
  "https://randomuser.me/api/portraits/med/women/35.jpg",
  "https://randomuser.me/api/portraits/med/men/21.jpg",
  "https://randomuser.me/api/portraits/med/women/59.jpg",
  "https://randomuser.me/api/portraits/med/men/89.jpg",
  "https://randomuser.me/api/portraits/med/women/80.jpg",
  "https://randomuser.me/api/portraits/med/men/34.jpg",
  "https://randomuser.me/api/portraits/med/men/83.jpg",
  "https://randomuser.me/api/portraits/med/women/20.jpg",
  "https://randomuser.me/api/portraits/med/men/38.jpg",
  "https://randomuser.me/api/portraits/med/men/66.jpg",
  "https://randomuser.me/api/portraits/med/men/28.jpg",
  "https://randomuser.me/api/portraits/med/women/46.jpg",
  "https://randomuser.me/api/portraits/med/women/82.jpg"
];

// Utils
const FRICTION = 0.95;
const MASS_FACTOR = 0.00003;

const MIN_RADIUS_IMAGE = 100;
const MAX_RADIUS_IMAGE = 150;

const MOUSE_MAGNET_DISTANCE = 300;
const IMAGES_MINIMUM_DISTANCE = 0;

const random = (min = 0, max = 1) => {
  return Math.random() * (max - min) + min;
};

const getDistance = (obj1, obj2) => {
  const { dx, dy } = getDeltas(obj1, obj2);

  return Math.sqrt(dx ** 2 + dy ** 2, 2);
};

const getDeltas = (obj1, obj2) => {
  return { dx: getDeltaX(obj1, obj2), dy: getDeltaY(obj1, obj2) };
};

const getDeltaX = (obj1, obj2) => {
  return obj2.position.x - obj1.position.x;
};

const getDeltaY = (obj1, obj2) => {
  return obj2.position.y - obj1.position.y;
};

const getContainerRect = () => {
  const rect = photosContainer.getBoundingClientRect();

  return {
    width: rect.width,
    height: rect.height
  };
};

const getRandomPosition = radius => {
  const rect = getContainerRect();

  return {
    x: random(0, rect.width - radius * 2),
    y: random(0, rect.height - radius * 2)
  };
};

const getRandomVelocity = () => {
  return {
    x: random(-0.5, 0.5),
    y: random(-0.5, 0.5)
  };
};

const getRandomRadius = () => {
  return random(MIN_RADIUS_IMAGE, MAX_RADIUS_IMAGE);
};

let images = [];

let mouse = {
  mass: 0.1,
  position: {
    x: 0,
    y: 0
  }
};

const createImage = src => {
  const element = document.createElement("img");
  element.src = src;
  element.classList.add("photo");

  element.radius = getRandomRadius();
  element.position = getRandomPosition(element.radius);
  element.velocity = getRandomVelocity();
  element.acceleration = { x: 0, y: 0 };
  element.mass = MASS_FACTOR * element.radius;

  return element;
};

photos.forEach(photo => {
  const image = createImage(photo);

  images.push(image);
  fragment.appendChild(image);
});

photosContainer.appendChild(fragment);

const init = () => {
  window.addEventListener("mousemove", ({ clientX, clientY }) => {
    mouse.position = { x: clientX, y: clientY };
  });
  requestAnimationFrame(step);
};

const step = () => {
  const containerRect = getContainerRect();

  images.forEach(image => {
    image.acceleration = { x: 0, y: 0 };

    images.forEach(obj => {
      if (obj === image) return;

      const distance = getDistance(image, obj);
      // const min_distance = image.radius + obj.radius;
      // if (distance > min_distance + IMAGES_MINIMUM_DISTANCE) return;

      const { dx, dy } = getDeltas(image, obj);
      const force =
        ((distance - 1.5 * (image.radius + obj.radius)) / distance) *
        image.mass;

      image.acceleration.x += dx * force;
      image.acceleration.y += dy * force;
    });

    const center = {
      mass: MASS_FACTOR * 300,
      position: {
        x: containerRect.width / 2,
        y: containerRect.height / 2
      }
    };

    // Magnet to center
    (() => {
      const { dx, dy } = getDeltas(image, center);
      const force = center.mass * 2;

      image.acceleration.x += dx * force;
      image.acceleration.y += dy * force;
    })();

    // Magnet to mouse
    (() => {
      const { dx, dy } = getDeltas(image, mouse);
      const distance = getDistance(image, mouse);
      const force = mouse.mass;

      if (distance < MOUSE_MAGNET_DISTANCE) {
        image.acceleration.x += -dx * force;
        image.acceleration.y += -dy * force;
      }
    })();

    image.velocity.x =
      image.velocity.x * FRICTION + image.acceleration.x * image.mass;
    image.velocity.y =
      image.velocity.y * FRICTION + image.acceleration.y * image.mass;

    // Collision with container
    // if (
    //   image.position.x + image.radius > containerRect.width ||
    //   image.position.x - image.radius < 0
    // ) {
    //   image.velocity.x = -image.velocity.x * FRICTION;
    // }

    // if (
    //   image.position.y + image.radius > containerRect.height ||
    //   image.position.y - image.radius < 0
    // ) {
    //   image.velocity.y = -image.velocity.y * FRICTION;
    // }

    image.position.x = image.position.x + image.velocity.x;
    image.position.y = image.position.y + image.velocity.y;

    const scale = image.radius / MIN_RADIUS_IMAGE;

    image.style.transform = `matrix3d(
      ${scale}, 0, 0, 0, 
      0, ${scale}, 0, 0, 
      0, 0, 1, 0, 
      ${image.position.x}, ${image.position.y}, 0, 1)`;
  });

  requestAnimationFrame(step);
};

init();
