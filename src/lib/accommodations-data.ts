export type DefaultAccommodation = {
  icon: string;
  title: string;
  bulletPoints: string[];
  sortOrder: number;
};

export const DEFAULT_ACCOMMODATIONS: DefaultAccommodation[] = [
  { icon: "Calendar", title: "24-Hour Booking Time Slots", bulletPoints: [], sortOrder: 0 },
  { icon: "Package", title: "Braiding Hair Included", bulletPoints: [], sortOrder: 1 },
  { icon: "Users", title: "Human Hair Pickup Available", bulletPoints: [], sortOrder: 2 },
  { icon: "Palette", title: "Custom Hair Color Blends", bulletPoints: [], sortOrder: 3 },
  { icon: "Droplets", title: "Shampoo & Nano Steam Conditioning", bulletPoints: [], sortOrder: 4 },
  { icon: "Scissors", title: "Hair Trims Included", bulletPoints: [], sortOrder: 5 },
  { icon: "Sparkles", title: "Luxury Hair Care Products", bulletPoints: [], sortOrder: 6 },
  { icon: "Coffee", title: "Complimentary Snacks & Beverages", bulletPoints: [], sortOrder: 7 },
  { icon: "UtensilsCrossed", title: "Complimentary Meals (Extended Appts)", bulletPoints: [], sortOrder: 8 },
  { icon: "Gift", title: "At-Home Hair Care Gift Bag", bulletPoints: [], sortOrder: 9 },
  { icon: "Laptop", title: "Quiet Work Environment", bulletPoints: [], sortOrder: 10 },
  { icon: "Ban", title: "No Overbooking — Ever", bulletPoints: [], sortOrder: 11 },
  { icon: "Car", title: "Hassle-Free Parking", bulletPoints: [], sortOrder: 12 },
  { icon: "Home", title: "In-Home Professional Salon", bulletPoints: [], sortOrder: 13 },
  { icon: "Armchair", title: "Luxury Salon Chair", bulletPoints: [], sortOrder: 14 },
  { icon: "Sofa", title: "Comfortable Break Space", bulletPoints: [], sortOrder: 15 },
  { icon: "Tv", title: "Entertainment at Your Fingertips", bulletPoints: [], sortOrder: 16 },
  { icon: "Clock", title: "Scheduled Comfort Breaks", bulletPoints: [], sortOrder: 17 },
  { icon: "Camera", title: "Personalized Follow-Up Care", bulletPoints: [], sortOrder: 18 },
  { icon: "Star", title: "Referral Program Incentives", bulletPoints: [], sortOrder: 19 },
];
