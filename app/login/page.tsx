import type { Metadata } from "next";
import LoginForm from "@/components/login-form";

const metaPreviewImage =
  // "https://i.pinimg.com/736x/d9/64/35/d96435c0442c2de1d33129993556331f.jpg";
  "https://i.pinimg.com/736x/30/12/85/301285f850a317256209321bffc63792.jpg";
export const metadata: Metadata = {
  title: "Login",
  description:
    "Secure login for the private Anandi and Vineet wedding dashboard, albums, and video gallery.",
  openGraph: {
    title: "Login | Anandi and Vineet Wedding",
    description:
      "Secure login for the private Anandi and Vineet wedding dashboard, albums, and video gallery.",
    images: [
      {
        url: metaPreviewImage,
        alt: "Wedding  image for Anandi and Vineet login page",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | Anandi and Vineet Wedding",
    description:
      "Secure login for the private Anandi and Vineet wedding dashboard, albums, and video gallery.",
    images: [metaPreviewImage],
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
