// Curated, Safe-for-Work answer bank. SERVER-ONLY — this module is never bundled
// into the client, so answers can't be scraped by solvers. Creators may only
// choose an answer from this list (never free-form text), which is what keeps
// the public content reviewable and on-brand.

import type { AnswerOption, Category } from '../../shared/types';

export type BankEntry = {
  id: string;
  category: Category;
  display: string;
  accept?: readonly string[];
};

// Each value is the human-readable answer; ids are derived from the slug so they
// stay unique and stable without hand-numbering.
const RAW: Record<Category, readonly string[]> = {
  movies: [
    'The Lion King', 'Finding Nemo', 'Toy Story', 'Star Wars', 'Harry Potter',
    'The Matrix', 'Jurassic Park', 'Frozen', 'Titanic', 'Up', 'Cars', 'Shrek',
    'Moana', 'Aladdin', 'The Little Mermaid', 'Despicable Me', 'Kung Fu Panda',
    'Ice Age', 'Ratatouille', 'The Incredibles', 'Snow White',
    'Beauty and the Beast', 'Pirates of the Caribbean', 'Jaws', 'King Kong',
    'Coco', 'Brave', 'Inside Out', 'Monsters Inc', 'Stranger Things',
    'Breaking Bad', 'The Office', 'SpongeBob SquarePants', 'Back to the Future',
    'The Wizard of Oz',
  ],
  animals: [
    'Dog', 'Cat', 'Elephant', 'Lion', 'Tiger', 'Monkey', 'Penguin', 'Dolphin',
    'Shark', 'Octopus', 'Butterfly', 'Bee', 'Spider', 'Snake', 'Frog', 'Turtle',
    'Rabbit', 'Horse', 'Cow', 'Pig', 'Chicken', 'Owl', 'Eagle', 'Kangaroo',
    'Koala', 'Panda', 'Giraffe', 'Zebra', 'Crocodile', 'Whale', 'Fox', 'Wolf',
    'Bear', 'Flamingo', 'Peacock', 'Crab', 'Snail', 'Ladybug', 'Dragonfly',
    'Hedgehog',
  ],
  food: [
    'Pizza', 'Hamburger', 'Hot Dog', 'Taco', 'Sushi', 'Ice Cream', 'Popcorn',
    'Pancakes', 'Spaghetti', 'French Fries', 'Donut', 'Cupcake', 'Watermelon',
    'Pineapple', 'Strawberry', 'Banana', 'Apple Pie', 'Chocolate', 'Coffee',
    'Sandwich', 'Salad', 'Cheese', 'Bacon and Eggs', 'Fried Chicken',
    'Birthday Cake', 'Cookies', 'Milkshake', 'Burrito', 'Ramen', 'Grilled Cheese',
    'Peanut Butter', 'Lemonade', 'Nachos', 'Waffles', 'Cotton Candy',
  ],
  nature: [
    'Rainbow', 'Volcano', 'Waterfall', 'Mountain', 'Beach', 'Sunset',
    'Snowflake', 'Thunderstorm', 'Forest', 'Desert', 'Ocean', 'River', 'Island',
    'Tornado', 'Earthquake', 'Full Moon', 'Sunrise', 'Autumn Leaves',
    'Cherry Blossom', 'Northern Lights', 'Coral Reef', 'Cactus', 'Palm Tree',
    'Lightning', 'Rainforest',
  ],
  sports: [
    'Soccer', 'Basketball', 'Baseball', 'Football', 'Tennis', 'Golf', 'Swimming',
    'Boxing', 'Surfing', 'Skiing', 'Skateboarding', 'Cycling', 'Running',
    'Bowling', 'Ice Hockey', 'Table Tennis', 'Volleyball', 'Archery', 'Fishing',
    'Weightlifting', 'Gymnastics', 'Rock Climbing', 'Karate', 'Horse Racing',
  ],
  objects: [
    'Umbrella', 'Telephone', 'Camera', 'Guitar', 'Clock', 'Key', 'Light Bulb',
    'Balloon', 'Scissors', 'Hammer', 'Rocket', 'Airplane', 'Bicycle',
    'Telescope', 'Candle', 'Gift Box', 'Backpack', 'Sunglasses', 'Headphones',
    'Anchor', 'Hourglass', 'Paintbrush', 'Lock and Key', 'Compass',
  ],
  places: [
    'Hospital', 'School', 'Library', 'Lighthouse', 'Castle', 'Farm', 'Airport',
    'Gas Station', 'Fire Station', 'Pyramid', 'The Eiffel Tower',
    'Statue of Liberty', 'Great Wall of China', 'Niagara Falls', 'Grand Canyon',
    'White House', 'Leaning Tower of Pisa', 'Mount Everest', 'Las Vegas',
    'Hollywood', 'North Pole', 'Stonehenge',
  ],
  jobs: [
    'Doctor', 'Teacher', 'Firefighter', 'Police Officer', 'Chef', 'Farmer',
    'Astronaut', 'Scientist', 'Artist', 'Musician', 'Pilot', 'Nurse', 'Dentist',
    'Mechanic', 'Photographer', 'Detective', 'Lifeguard', 'Mail Carrier',
    'Magician', 'Judge', 'Plumber', 'Electrician', 'Veterinarian', 'Sailor',
    'Soldier', 'Gardener', 'Barber',
  ],
  music: [
    'Rock and Roll', 'Hip Hop', 'Jazz', 'Classical Music', 'Country Music',
    'Pop Music', 'Drummer', 'Electric Guitar', 'Piano', 'Violin', 'Microphone',
    'Music Festival', 'Karaoke', 'Opera', 'Marching Band', 'Disco',
    'Heavy Metal', 'Saxophone', 'Trumpet', 'Flute', 'Conductor', 'Choir',
  ],
  phrases: [
    'Break the Ice', 'Piece of Cake', 'Raining Cats and Dogs', 'Hit the Books',
    'Under the Weather', 'Spill the Beans', 'Cold Feet', 'When Pigs Fly',
    'A Needle in a Haystack', 'Time Flies', 'Broken Heart', 'Love at First Sight',
    'Head Over Heels', 'Couch Potato', 'Night Owl', 'Bookworm', 'Busy Bee',
    'Sweet Tooth', 'Bull in a China Shop', 'The Early Bird Gets the Worm',
    'Let the Cat Out of the Bag', 'Once in a Blue Moon', 'A Penny for Your Thoughts',
    'Burning the Midnight Oil',
  ],
};

const slug = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const BANK: readonly BankEntry[] = (
  Object.keys(RAW) as Category[]
).flatMap((category) =>
  RAW[category].map((display) => ({
    id: `${category}:${slug(display)}`,
    category,
    display,
  }))
);

const BY_ID = new Map<string, BankEntry>(BANK.map((e) => [e.id, e]));
const BY_CATEGORY = new Map<Category, BankEntry[]>();
for (const entry of BANK) {
  const list = BY_CATEGORY.get(entry.category) ?? [];
  list.push(entry);
  BY_CATEGORY.set(entry.category, list);
}

export const bankSize = BANK.length;

export const getEntry = (id: string): BankEntry | undefined => BY_ID.get(id);

export const entriesByCategory = (category: Category): BankEntry[] =>
  BY_CATEGORY.get(category) ?? [];

// Fisher–Yates sample of `n` answer options from a category, for the create UI.
export const sampleOptions = (category: Category, n: number): AnswerOption[] => {
  const pool = entriesByCategory(category).slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = pool[i];
    const b = pool[j];
    if (a && b) {
      pool[i] = b;
      pool[j] = a;
    }
  }
  return pool.slice(0, Math.min(n, pool.length)).map((e) => ({
    id: e.id,
    display: e.display,
  }));
};
