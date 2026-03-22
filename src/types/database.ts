export type Database = {
  public: {
    Tables: {
      museums: {
        Row: Museum;
        Insert: Omit<Museum, "id" | "created_at">;
        Update: Partial<Omit<Museum, "id" | "created_at">>;
      };
      programs: {
        Row: Program;
        Insert: Omit<Program, "id">;
        Update: Partial<Omit<Program, "id">>;
      };
      reviews: {
        Row: Review;
        Insert: Omit<Review, "id" | "created_at">;
        Update: Partial<Omit<Review, "id" | "created_at">>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, "id" | "created_at">;
        Update: Partial<Omit<Favorite, "id" | "created_at">>;
      };
      visits: {
        Row: Visit;
        Insert: Omit<Visit, "id" | "created_at">;
        Update: Partial<Omit<Visit, "id" | "created_at">>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
    };
  };
};

export type Museum = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: MuseumCategory;
  hours: string;
  price: string;
  description: string;
  image_url: string;
  phone: string;
  website: string;
  region: string;
  target_age_min: number;
  target_age_max: number;
  created_at: string;
};

export type Program = {
  id: string;
  museum_id: string;
  name: string;
  target_age: string;
  schedule: string;
  price: string;
  description: string;
};

export type Review = {
  id: string;
  museum_id: string;
  user_id: string;
  rating: number;
  content: string;
  child_age: number;
  created_at: string;
};

export type Favorite = {
  id: string;
  museum_id: string;
  user_id: string;
  created_at: string;
};

export type Visit = {
  id: string;
  museum_id: string;
  user_id: string;
  visited_at: string;
  memo: string;
  created_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  nickname: string;
  children_info: ChildInfo[];
  region: string;
  created_at: string;
};

export type ChildInfo = {
  name: string;
  age: number;
};

export type MuseumCategory =
  | "history"
  | "science"
  | "art"
  | "nature"
  | "children"
  | "experience";

export const CATEGORY_LABELS: Record<MuseumCategory, string> = {
  history: "역사",
  science: "과학",
  art: "미술",
  nature: "자연사",
  children: "어린이",
  experience: "체험",
};

export const REGIONS = [
  "서울",
  "경기",
  "인천",
  "강원",
  "충북",
  "충남",
  "대전",
  "세종",
  "전북",
  "전남",
  "광주",
  "경북",
  "경남",
  "대구",
  "울산",
  "부산",
  "제주",
] as const;

export type Region = (typeof REGIONS)[number];
