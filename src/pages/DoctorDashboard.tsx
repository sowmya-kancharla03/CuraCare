import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Calendar, Clock, User, Phone, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorAppointments = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/login");
        return;
      }

      // Get doctor info
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("doctor_id, role")
        .eq("user_id", session.user.id)
        .eq("role", "doctor")
        .single();

      if (!roleData || !roleData.doctor_id) {
        toast({
          title: "Access Denied",
          description: "You don't have doctor privileges",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      // Get doctor details
      const { data: doctor } = await supabase
        .from("doctors")
        .select("*")
        .eq("id", roleData.doctor_id)
        .single();

      setDoctorInfo(doctor);

      // Get appointments for this doctor
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("doctor_id", roleData.doctor_id)
        .order("appointment_date", { ascending: true });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load appointments",
          variant: "destructive",
        });
      } else {
        setAppointments(data || []);
      }

      setLoading(false);
    };

    fetchDoctorAppointments();
  }, [toast, navigate]);

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", appointmentId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Appointment ${newStatus}`,
      });
      // Update local state
      setAppointments(
        appointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
      );
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          {doctorInfo && (
            <p className="text-muted-foreground">
              Dr. {doctorInfo.name} - {doctorInfo.specialty}
            </p>
          )}
        </div>

        {appointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No appointments scheduled yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>Appointment Details</CardTitle>
                    <Badge
                      variant={
                        appointment.status === "confirmed"
                          ? "default"
                          : appointment.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Patient:</span>
                        <span>{appointment.patient_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Phone:</span>
                        <span>{appointment.patient_phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Date:</span>
                        <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">Time:</span>
                        <span>{appointment.appointment_time}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="p-3 bg-muted rounded-md">
                        <p className="text-sm font-medium mb-1">Notes:</p>
                        <p className="text-sm">{appointment.notes}</p>
                      </div>
                    )}

                    {appointment.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleStatusUpdate(appointment.id, "confirmed")}
                          className="flex-1"
                          variant="default"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                          className="flex-1"
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
