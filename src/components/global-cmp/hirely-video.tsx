"use client";
import React, { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

const HirelyVideo = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const videoRef = useRef(null);

  // Auto-play video when dialog opens
  useEffect(() => {
    if (isDialogOpen && videoRef.current) {
      (videoRef.current as any).play().catch(console.error);
    }
  }, [isDialogOpen]);

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && videoRef.current) {
      (videoRef.current as any).pause();
      (videoRef.current as any).currentTime = 0;
    }
  };

  return (
    <div className="p-8">
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogTrigger
          className="p-0"
          onClick={() => setIsDialogOpen(true)}
          asChild
        >
          <Button size="lg" variant="outline" className="p-5 h-12">
            <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            Watch Demo
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-5xl w-full p-0 border-none">
          {/* Video Container */}
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              controls
              autoPlay
              playsInline
            >
              {/* Sample video - replace with your actual video URL */}
              <source
                src="https://res.cloudinary.com/dmmqpvdnb/video/upload/v1748751467/Hirely-video.mp4"
                type="video/mp4"
              />
              <source
                src="https://res.cloudinary.com/dmmqpvdnb/video/upload/v1748751467/Hirely-video.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HirelyVideo;
