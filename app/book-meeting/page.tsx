"use client";

import { useState, useEffect, Suspense } from "react";
import { Calendar, CheckCircle2, Loader2, ArrowLeft, Clock, Video, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { trackEvent } from "@/lib/analytics";
import Link from "next/link";

const PREDEFINED_TIME_SLOTS = [
  { id: "slot-1", time: "09:00 AM", day: "Monday" },
  { id: "slot-2", time: "10:30 AM", day: "Monday" },
  { id: "slot-3", time: "02:00 PM", day: "Monday" },
  { id: "slot-4", time: "09:00 AM", day: "Tuesday" },
  { id: "slot-5", time: "11:00 AM", day: "Tuesday" },
  { id: "slot-6", time: "03:30 PM", day: "Tuesday" },
  { id: "slot-7", time: "10:00 AM", day: "Wednesday" },
  { id: "slot-8", time: "01:00 PM", day: "Wednesday" },
  { id: "slot-9", time: "04:00 PM", day: "Wednesday" },
  { id: "slot-10", time: "09:30 AM", day: "Thursday" },
  { id: "slot-11", time: "12:00 PM", day: "Thursday" },
  { id: "slot-12", time: "03:00 PM", day: "Thursday" },
  { id: "slot-13", time: "10:00 AM", day: "Friday" },
  { id: "slot-14", time: "01:30 PM", day: "Friday" },
];

const PREDEFINED_AGENTS = [
  { id: "agent-praneeth", name: "Praneeth Assist", role: "Discovery Specialist" },
  { id: "agent-alex", name: "Alex", role: "Technical Lead" },
];

const PREDEFINED_MEETING_TYPES = [
  { id: "type-discovery", name: "Discovery Call", duration: "30 min" },
  { id: "type-demo", name: "Product Demo", duration: "45 min" },
];

interface BookingFormData {
  name: string;
  email: string;
  company: string;
  selectedTimeSlot: string | null;
  selectedAgent: string | null;
  selectedMeetingType: string | null;
}

const isValidTimeSlot = (slotId: string) => 
  PREDEFINED_TIME_SLOTS.some(slot => slot.id === slotId);

const isValidAgent = (agentId: string) => 
  PREDEFINED_AGENTS.some(agent => agent.id === agentId);

const isValidMeetingType = (typeId: string) => 
  PREDEFINED_MEETING_TYPES.some(type => type.id === typeId);

function BookMeetingContent() {
  const [formData, setFormData] = useState<BookingFormData>({
    name: "",
    email: "",
    company: "",
    selectedTimeSlot: null,
    selectedAgent: null,
    selectedMeetingType: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    trackEvent("custom_booking_page_view");
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.company.trim()) {
      newErrors.company = "Company name is required";
    }
    if (!formData.selectedTimeSlot) {
      newErrors.timeSlot = "Please select a time slot";
    } else if (!isValidTimeSlot(formData.selectedTimeSlot)) {
      newErrors.timeSlot = "Invalid time slot selected";
    }
    if (!formData.selectedAgent) {
      newErrors.agent = "Please select an agent";
    } else if (!isValidAgent(formData.selectedAgent)) {
      newErrors.agent = "Invalid agent selected";
    }
    if (!formData.selectedMeetingType) {
      newErrors.meetingType = "Please select a meeting type";
    } else if (!isValidMeetingType(formData.selectedMeetingType)) {
      newErrors.meetingType = "Invalid meeting type selected";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      trackEvent("booking_validation_failed");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (!result.success) {
        setErrors({ submit: result.error || "Booking failed" });
        trackEvent("booking_backend_validation_failed");
        return;
      }

      setIsSuccess(true);
      trackEvent("booking_success", { 
        timeSlot: formData.selectedTimeSlot,
        agent: formData.selectedAgent,
        meetingType: formData.selectedMeetingType
      });
    } catch (err) {
      setErrors({ submit: "Something went wrong. Please try again." });
      console.error("Booking error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center bg-white/5 border-white/10 rounded-3xl">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Booking Confirmed!</h1>
          <p className="text-gray-300 mb-8">
            You&apos;ll receive a confirmation email shortly with all the details.
          </p>
          <Button asChild className="w-full bg-violet-600 hover:bg-violet-700">
            <Link href="/">Back to Home</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F1E] flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 py-12">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-black text-white mb-3">
            Book a Meeting with AI Agent
          </h1>
          <p className="text-xl text-gray-400">
            Choose from our predefined options to schedule your call.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="bg-white/5 border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-400" />
              Your Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="john@company.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="company" className="text-white">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Your Company Name"
                />
                {errors.company && (
                  <p className="text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.company}
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card className="bg-white/5 border-white/10 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-violet-400" />
              Select Time Slot
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PREDEFINED_TIME_SLOTS.map((slot) => (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, selectedTimeSlot: slot.id })}
                  className={`p-4 rounded-2xl border-2 transition-all text-left ${
                    formData.selectedTimeSlot === slot.id 
                      ? "border-violet-500 bg-violet-500/10" 
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <p className="font-bold text-white text-sm">{slot.day}</p>
                  <p className="text-gray-400 text-xs">{slot.time}</p>
                </button>
              ))}
            </div>
            {errors.timeSlot && (
              <p className="text-red-400 text-sm mt-3 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.timeSlot}
              </p>
            )}
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Video className="w-5 h-5 text-violet-400" />
                AI Agent
              </h2>
              <div className="space-y-3">
                {PREDEFINED_AGENTS.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedAgent: agent.id })}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      formData.selectedAgent === agent.id 
                        ? "border-violet-500 bg-violet-500/10" 
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <p className="font-bold text-white">{agent.name}</p>
                    <p className="text-gray-400 text-sm">{agent.role}</p>
                  </button>
                ))}
              </div>
              {errors.agent && (
                <p className="text-red-400 text-sm mt-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.agent}
                </p>
              )}
            </Card>

            <Card className="bg-white/5 border-white/10 rounded-3xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-violet-400" />
                Meeting Type
              </h2>
              <div className="space-y-3">
                {PREDEFINED_MEETING_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, selectedMeetingType: type.id })}
                    className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                      formData.selectedMeetingType === type.id 
                        ? "border-violet-500 bg-violet-500/10" 
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-white">{type.name}</p>
                      <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30">{type.duration}</Badge>
                    </div>
                  </button>
                ))}
              </div>
              {errors.meetingType && (
                <p className="text-red-400 text-sm mt-3 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.meetingType}
                </p>
              )}
            </Card>
          </div>

          {errors.submit && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.submit}
              </p>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 text-lg font-bold bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-600/30 rounded-2xl"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Confirming Booking...
              </>
            ) : (
              "Confirm Booking"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function BookMeetingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center">
      <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
    </div>}>
      <BookMeetingContent />
    </Suspense>
  );
}
