import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { DoctorCard } from "@/components/DoctorCard";
import { Plus, Heart, Users, Award, Clock } from "lucide-react";

const Index = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDoctors, setAddingDoctors] = useState(false);
  const [creatingDoctorAccounts, setCreatingDoctorAccounts] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchDoctors = async () => {
    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive",
      });
    } else {
      setDoctors(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const addSampleDoctors = async () => {
    setAddingDoctors(true);
    
    const sampleDoctors = [
      {
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        experience_years: 15,
        rating: 4.8,
        available: true,
      },
      {
        name: "Dr. Michael Chen",
        specialty: "Pediatrics",
        experience_years: 12,
        rating: 4.9,
        available: true,
      },
      {
        name: "Dr. Emily Williams",
        specialty: "Dermatology",
        experience_years: 10,
        rating: 4.7,
        available: true,
      },
      {
        name: "Dr. James Brown",
        specialty: "Orthopedics",
        experience_years: 18,
        rating: 4.8,
        available: true,
      },
      {
        name: "Dr. Lisa Anderson",
        specialty: "Neurology",
        experience_years: 14,
        rating: 4.9,
        available: true,
      },
      {
        name: "Dr. David Martinez",
        specialty: "General Practice",
        experience_years: 20,
        rating: 4.6,
        available: true,
      },
    ];

    const { error } = await supabase.from("doctors").insert(sampleDoctors);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add sample doctors",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Sample doctors added successfully",
      });
      fetchDoctors();
    }

    setAddingDoctors(false);
  };

  const createDoctorAccounts = async () => {
    setCreatingDoctorAccounts(true);
    
    // Doctor credentials mapping
    const doctorCredentials = [
      { email: "sarah.johnson@hospital.com", password: "doctor123", name: "Dr. Sarah Johnson" },
      { email: "michael.chen@hospital.com", password: "doctor123", name: "Dr. Michael Chen" },
      { email: "emily.williams@hospital.com", password: "doctor123", name: "Dr. Emily Williams" },
      { email: "james.brown@hospital.com", password: "doctor123", name: "Dr. James Brown" },
      { email: "lisa.anderson@hospital.com", password: "doctor123", name: "Dr. Lisa Anderson" },
      { email: "david.martinez@hospital.com", password: "doctor123", name: "Dr. David Martinez" },
    ];

    let successCount = 0;
    let credentials = [];

    for (const cred of doctorCredentials) {
      // Find the doctor in the database
      const { data: doctorData } = await supabase
        .from("doctors")
        .select("id")
        .eq("name", cred.name)
        .single();

      if (!doctorData) continue;

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cred.email,
        password: cred.password,
      });

      if (authError && !authError.message.includes("already registered")) {
        console.error(`Failed to create account for ${cred.name}:`, authError);
        continue;
      }

      // If user was just created, assign doctor role
      if (authData?.user?.id) {
        // Check if role already exists
        const { data: existingRole } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", authData.user.id)
          .eq("role", "doctor")
          .maybeSingle();

        if (!existingRole) {
          // Assign doctor role
          await supabase.from("user_roles").insert({
            user_id: authData.user.id,
            role: "doctor",
            doctor_id: doctorData.id,
          });
        }

        successCount++;
        credentials.push(cred);
      }
    }

    if (successCount > 0) {
      toast({
        title: "Success",
        description: `Created ${successCount} doctor accounts`,
      });
      
      // Show credentials
      const credentialsText = credentials
        .map(c => `${c.name}: ${c.email} / ${c.password}`)
        .join('\n');
      
      console.log("Doctor Login Credentials:\n", credentialsText);
      alert(`Doctor accounts created!\n\nCredentials:\n${credentialsText}\n\n(Also check console for credentials)`);
    } else {
      toast({
        title: "Info",
        description: "Doctor accounts may already exist",
        variant: "default",
      });
    }

    setCreatingDoctorAccounts(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Welcome to CuraCare
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your health is our priority. Experience world-class medical care with our team of expert doctors and state-of-the-art facilities.
            </p>
            <div className="flex gap-4">
              {user && (
                <>
                  <Button 
                    onClick={addSampleDoctors} 
                    disabled={addingDoctors || doctors.length > 0}
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {addingDoctors ? "Adding..." : "Add Sample Doctors"}
                  </Button>
                  
                  <Button 
                    onClick={createDoctorAccounts} 
                    disabled={creatingDoctorAccounts || doctors.length === 0}
                    size="lg"
                    variant="secondary"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    {creatingDoctorAccounts ? "Creating..." : "Create Doctor Logins"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <Heart className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-3xl font-bold mb-2">15+</h3>
                <p className="text-muted-foreground">Years of Excellence</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-3xl font-bold mb-2">50+</h3>
                <p className="text-muted-foreground">Expert Doctors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-3xl font-bold mb-2">10k+</h3>
                <p className="text-muted-foreground">Happy Patients</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Clock className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-3xl font-bold mb-2">24/7</h3>
                <p className="text-muted-foreground">Emergency Care</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Our Expert Doctors</h2>
          <p className="text-muted-foreground">
            Meet our team of highly qualified and experienced medical professionals
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading doctors...</p>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              {user 
                ? "No doctors available yet. Click 'Add Sample Doctors' above to get started." 
                : "Please login to view and book appointments with our doctors."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
