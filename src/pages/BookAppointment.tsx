import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);
  const [formData, setFormData] = useState({
    patientName: "",
    patientPhone: "",
    appointmentDate: "",
    appointmentTime: "",
    notes: "",
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      const { data, error } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", doctorId)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load doctor details",
          variant: "destructive",
        });
        navigate("/");
      } else {
        setDoctor(data);
      }
    };

    fetchDoctor();
  }, [doctorId, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast({
        title: "Please login",
        description: "You need to login to book an appointment",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      user_id: session.user.id,
      doctor_id: doctorId,
      appointment_date: formData.appointmentDate,
      appointment_time: formData.appointmentTime,
      patient_name: formData.patientName,
      patient_phone: formData.patientPhone,
      notes: formData.notes,
    });

    if (error) {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Appointment booked!",
        description: "Your appointment has been successfully booked",
      });
      navigate("/appointments");
    }

    setLoading(false);
  };

  if (!doctor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Book Appointment with Dr. {doctor.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="patientName">Patient Name</Label>
                <Input
                  id="patientName"
                  value={formData.patientName}
                  onChange={(e) =>
                    setFormData({ ...formData, patientName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="patientPhone">Phone Number</Label>
                <Input
                  id="patientPhone"
                  type="tel"
                  value={formData.patientPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, patientPhone: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="appointmentDate">Appointment Date</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={formData.appointmentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentDate: e.target.value })
                  }
                  required
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <Label htmlFor="appointmentTime">Appointment Time</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={formData.appointmentTime}
                  onChange={(e) =>
                    setFormData({ ...formData, appointmentTime: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Booking..." : "Confirm Booking"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
