
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-theme-primary flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-gradient-theme-secondary border-border shadow-lg">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto p-4 bg-gradient-to-br from-primary to-accent rounded-xl w-fit mb-6">
            <Sparkles className="h-12 w-12 text-primary-foreground" />
          </div>
          <CardTitle className="text-5xl font-bold text-foreground mb-4">
            Welcome to NeuraFlow
          </CardTitle>
          <p className="text-xl text-muted-foreground">
            Start building your amazing workflow automation project here!
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <Button 
            size="lg" 
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold px-8"
          >
            Get Started
            <ArrowRight className="h-5 w-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
