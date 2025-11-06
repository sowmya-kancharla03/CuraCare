import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DoctorCardProps {
  doctor: {
    id: string;
    name: string;
    specialty: string;
    experience_years: number;
    image_url: string | null;
    rating: number;
    available: boolean;
  };
}

export const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleBookAppointment = async () => {
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

    navigate(`/book/${doctor.id}`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden bg-muted">
        {doctor.image_url ? (
          <img
            src={doctor.image_url}
            alt={doctor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10">
            <span className="text-6xl text-primary">
              {doctor.name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <CardContent className="pt-4">
        <h3 className="text-xl font-semibold mb-1">{doctor.name}</h3>
        <Badge variant="secondary" className="mb-2">
          {doctor.specialty}
        </Badge>
        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
          <Star className="w-4 h-4 fill-primary text-primary" />
          <span>{doctor.rating}</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {doctor.experience_years} years of experience
        </p>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleBookAppointment}
          disabled={!doctor.available}
        >
          <Calendar className="w-4 h-4 mr-2" />
          {doctor.available ? "Book Appointment" : "Unavailable"}
        </Button>
      </CardFooter>
    </Card>
  );
};
