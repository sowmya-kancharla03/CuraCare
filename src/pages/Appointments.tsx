import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { Calendar, Clock, User, Phone } from "lucide-react";

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAppointments = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("appointments")
        .select(`
          *,
          doctors (
            name,
            specialty
          )
        `)
        .eq("user_id", session.user.id)
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

    fetchAppointments();
  }, [toast]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Appointments</h1>
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                You have no appointments yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {appointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>Dr. {appointment.doctors.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {appointment.doctors.specialty}
                      </p>
                    </div>
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
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.patient_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.patient_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(appointment.appointment_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{appointment.appointment_time}</span>
                    </div>
                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-md">
                        <p className="text-sm">{appointment.notes}</p>
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
