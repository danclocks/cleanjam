"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowRight, Recycle, Star, Users } from "lucide-react";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="bg-light text-dark">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container">
          <a className="navbar-brand fw-bold text-success" href="#">
            <Image
              src="/images/logo.png"
              alt="CleanJamaica Logo"
              width={40}
              height={40}
              className="me-2 rounded-circle"
            />
            CleanJamaica
          </a>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center">
              <li className="nav-item">
                <a className="nav-link fw-semibold text-success" href="#about">
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-semibold text-success" href="#rewards">
                  Rewards
                </a>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-outline-success btn-sm rounded-pill px-3 mx-2"
                  onClick={() => router.push("/(auth)/login")}
                >
                  Log In
                </button>
              </li>
              <li className="nav-item">
                <button
                  className="btn btn-success btn-sm rounded-pill px-3"
                  onClick={() => router.push("/(auth)/register")}
                >
                  Sign Up
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="container py-5 text-center text-md-start d-flex flex-column flex-md-row align-items-center justify-content-between">
        <div className="col-md-6">
          <h1 className="display-5 fw-bold text-success mb-3">
            Together We Keep Jamaica Beautiful 🇯🇲
          </h1>
          <p className="lead text-secondary mb-4">
            Join the movement to report garbage, track recycling, and earn
            points for helping keep Jamaica clean and green!
          </p>

          <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3">
            <button
              className="btn btn-success btn-lg rounded-pill px-4"
              onClick={() => router.push("/(auth)/register")}
            >
              Sign Up
            </button>
            <button
              className="btn btn-outline-success btn-lg rounded-pill px-4"
              onClick={() => router.push("/(auth)/login")}
            >
              Log In
            </button>
            <button
              className="btn btn-link text-success fw-semibold d-flex align-items-center"
              onClick={() =>
                window.scrollTo({ top: 700, behavior: "smooth" })
              }
            >
              Learn More <ArrowRight className="ms-2" size={18} />
            </button>
          </div>
        </div>

        <div className="col-md-5 mt-5 mt-md-0 text-center">
          <Image
            src="/images/cleanup-team.png"
            alt="Community Cleanup"
            width={480}
            height={360}
            className="img-fluid rounded-4 shadow-lg"
          />
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="py-5 bg-white border-top border-light">
        <div className="container text-center">
          <h2 className="fw-bold text-success mb-3">About CleanJamaica</h2>
          <p className="lead text-secondary mb-5">
            CleanJamaica empowers citizens to report uncollected garbage, illegal
            dumping, and track recycling progress — creating a cleaner Jamaica
            through technology and teamwork.
          </p>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 border rounded-4 shadow-sm h-100">
                <Recycle className="text-success mb-3" size={40} />
                <h4 className="fw-semibold text-success mb-2">
                  Report & Recycle
                </h4>
                <p className="text-muted">
                  Instantly report garbage or illegal dumping and monitor
                  recycling efforts near you.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 border rounded-4 shadow-sm h-100" id="rewards">
                <Star className="text-warning mb-3" size={40} />
                <h4 className="fw-semibold text-success mb-2">
                  Earn Reward Points
                </h4>
                <p className="text-muted">
                  Every report and recycling activity earns you points — redeem
                  them for perks, recognition, and prizes!
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-4 border rounded-4 shadow-sm h-100">
                <Users className="text-success mb-3" size={40} />
                <h4 className="fw-semibold text-success mb-2">
                  Join the Movement
                </h4>
                <p className="text-muted">
                  Be part of Jamaica’s transformation — inspire your community
                  and create lasting environmental change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-5 bg-success text-white text-center">
        <div className="container">
          <h2 className="fw-bold mb-3">Ready to Make a Difference?</h2>
          <p className="lead mb-4">
            Sign up today and start earning points while keeping Jamaica clean!
          </p>
          <button
            onClick={() => router.push("/(auth)/register")}
            className="btn btn-warning btn-lg rounded-pill fw-bold text-success px-5 shadow-sm"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-4 bg-light text-center border-top">
        <p className="text-muted mb-0">
          © {new Date().getFullYear()} CleanJamaica. Built with ❤️ using Next.js,
          Supabase, and Bootstrap 5.
        </p>
      </footer>
    </main>
  );
}
