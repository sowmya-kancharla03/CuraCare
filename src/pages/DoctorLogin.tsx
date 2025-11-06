import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope } from "lucide-react";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Check if user has doctor role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .eq("role", "doctor")
      .maybeSingle();

    if (!roleData) {
      await supabase.auth.signOut();
      toast({
        title: "Access Denied",
        description: "This login is for doctors only. Please use patient login.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Login successful",
      description: "Welcome, Doctor!",
    });
    navigate("/doctor-dashboard");

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Stethoscope className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Doctor Login</CardTitle>
          <CardDescription>Sign in to access your doctor dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login as Doctor"}
            </Button>
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Are you a patient?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Patient Login
                </Link>
              </p>
              <p className="text-sm text-muted-foreground">
                <Link to="/" className="text-primary hover:underline">
                  Back to Home
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
