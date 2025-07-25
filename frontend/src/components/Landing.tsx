import { useState, useEffect } from "react";
// @ts-ignore
import { googleAuth } from '../services/googleAuth';
import EssayCard from "./EssayCard";
import googleLogo from '../assets/drawn_google.png';
import dots from '../assets/dots.png';
import pencil from '../assets/pencil.png';
import pen from '../assets/pen.png';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface LandingProps {
  onUserChange: (user: User | null) => void;
}

interface Doodle {
  src: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  size: number;
}

export default function Landing({ onUserChange }: LandingProps) {
  const [loading, setLoading] = useState(false);
  const [doodles, setDoodles] = useState<Doodle[]>([]);

  useEffect(() => {
    checkCurrentUser();
    generateRandomDoodles();
  }, []);

  const generateRandomDoodles = () => {
    const doodleFiles = [dots, pen, pencil];
    const numDoodles = Math.floor(Math.random() * 4) + 1;
    const newDoodles: Doodle[] = [];

    for (let i = 0; i < numDoodles; i++) {
      const randomFile = doodleFiles[Math.floor(Math.random() * doodleFiles.length)];
      newDoodles.push({
        src: randomFile,
        x: Math.random() * 80 + 10, 
        y: Math.random() * 70 + 15, 
        rotation: Math.random() * 360 - 180, 
        opacity: Math.random() * 0.3 + 0.1, 
        size: Math.random() * 60 + 40 
      });
    }

    setDoodles(newDoodles);
  };

  const checkCurrentUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/user`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        onUserChange(userData.user);
      }
    } catch (error) {
      console.error("Error checking current user:", error);
    }
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      await googleAuth.signIn();
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Failed to start login process");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative paper-background">
      {/* Left margin line */}
      <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-red-300 opacity-60"></div>
      
      {/* Random doodles */}
      {doodles.map((doodle, index) => (
        <img
          key={index}
          src={doodle.src}
          alt="doodle"
          className="absolute pointer-events-none z-0"
          style={{
            left: `${doodle.x}%`,
            top: `${doodle.y}%`,
            transform: `rotate(${doodle.rotation}deg)`,
            opacity: doodle.opacity,
            width: `${doodle.size}px`,
            height: `${doodle.size}px`,
          }}
        />
      ))}
      
      <div className="relative z-10 p-6 mx-auto ml-20">
        <div className="mb-16 flex flex-col items-start">
          <h1 
            className="text-7xl mb-2 transform text-black font-serif"
          >
            EssayBinder
          </h1>
          <p 
            className="text-3xl transform underline decoration-1 text-gray-800"
          >
            organize your <span className="text-blue-500">Google Docs</span> essays
          </p>
        </div>

        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
            <EssayCard 
              essay={{
                id: "demo1",
                title: "Why I Want to Study Computer Science",
                characterCount: 2847,
                wordCount: 487,
                tags: ["personal", "academics", "tech"],
                createdDate: "2024-09-15",
                lastModified: "2024-10-22",
                googleDocId: "demo1",
                applicationFor: "Stanford University",
                applicationStatus: "submitted",
                notes: "Used for multiple CS program applications"
              }}
              onAddTag={() => {}}
              onRemoveTag={() => {}}
              onUpdateApplication={() => {}}
              onUpdateNotes={() => {}}
              onPositionChange={() => {}}
            />

            <EssayCard 
              essay={{
                id: "demo2", 
                title: "Overcoming Challenges: My Journey with Dyslexia",
                characterCount: 3201,
                wordCount: 542,
                tags: ["growth", "challenges", "perseverance"],
                createdDate: "2024-08-03",
                lastModified: "2024-11-15",
                googleDocId: "demo2",
                applicationFor: "UC Berkeley",
                applicationStatus: "accepted",
                notes: "Really proud of this one - very personal"
              }}
              onAddTag={() => {}}
              onRemoveTag={() => {}}
              onUpdateApplication={() => {}}
              onUpdateNotes={() => {}}
              onPositionChange={() => {}}
            />

            <EssayCard 
              essay={{
                id: "demo3",
                title: "Leadership Experience in Student Government", 
                characterCount: 2156,
                wordCount: 367,
                tags: ["leadership", "community", "politics"],
                createdDate: "2024-07-12",
                lastModified: "2024-09-28",
                googleDocId: "demo3",
                applicationFor: "",
                applicationStatus: "draft",
                notes: "Need to add more specific examples"
              }}
              onAddTag={() => {}}
              onRemoveTag={() => {}}
              onUpdateApplication={() => {}}
              onUpdateNotes={() => {}}
              onPositionChange={() => {}}
            />
          </div>
        </div>

        <div className="ml-2 mb-20">
          <p 
            className="text-3xl mb-1 text-gray-700 leading-[3rem]"
          >
            <ol className="list-decimal">
              <li>
                Connect your Google account to select essays through a simple URL copy-paste.
              </li>
              <li>
                EssayBinder will automatically calculate word and character count. <span className="text-red-500">(It never stores your essay's content!)</span>
              </li>
              <li>You can...
                <ol className="ml-5">
                  <li>- create colorful tags to categorize your work!</li>
                  <li>- filter by character, word count, status, and much more!</li>
                  <li>- keep track of what you've used each essay for!</li>
                </ol>
              </li>
            </ol>
          </p>
        </div>
        <div className="flex justify-center">
            <p className="text-gray-700 text-4xl font-bold font-serif">
              Reusing application essays has <span className="text-purple-400 underline-offset-2 underline decoration-1" style={{fontFamily: 'Caveat, cursive'}}>never been easier!</span>
            </p>
          </div>

          <div className="flex items-center justify-center mr-4 mt-10">
            <span className="font-bold text-gray-500 transform -rotate-12 text-3xl">get started</span>
            <span className="text-gray-500 ml-2 mr-4 transform rotate-12 text-3xl">→</span>
            <img 
              onClick={handleLogin}
              className="google-logo h-25 mr-20 w-25"
              src={googleLogo}
            >
            </img>
          </div>

      </div>
    </div>
  );
}
