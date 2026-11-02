import Link from "next/link";
import { site, whatsappLink } from "@/lib/site";
import Logo from "./Logo";
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon } from "./Icons";

export default function Footer() {
  const wa = whatsappLink("Hi 3D PrintLab LB, I have a question");
  const social = [
    site.instagram && { href: `https://instagram.com/${site.instagram}`, label: `@${site.instagram}`, Icon: InstagramIcon },
    site.facebook && { href: site.facebook, label: "Facebook", Icon: FacebookIcon },
    site.tiktok && { href: site.tiktok, label: "TikTok", Icon: TikTokIcon },
    wa && { href: wa, label: "WhatsApp", Icon: WhatsAppIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof InstagramIcon }[];
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-1 text-sm text-ink-2">{site.tagline}. Cash on delivery all over Lebanon.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Shop</p>
          <ul className="mt-2 space-y-1 text-ink-2">
            <li><Link href="/c/sports" className="hover:text-ink">Sports</Link></li>
            <li><Link href="/c/everyday-use" className="hover:text-ink">Everyday Use</Link></li>
            <li><Link href="/c/souvenirs" className="hover:text-ink">Souvenirs</Link></li>
            <li><Link href="/custom" className="hover:text-ink">Custom orders</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Follow us</p>
          <ul className="mt-2 space-y-2">
            {social.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-ink-2 hover:text-ink">
                  <Icon /> {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="border-t border-line py-4 text-center text-xs text-ink-3">© {new Date().getFullYear()} {site.name}</p>
    </footer>
  );
}
