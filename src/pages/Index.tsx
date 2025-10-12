import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, Check, Loader2, CheckCircle2, MessageSquare, PhoneCall, Bot, Zap, Smartphone, Headphones } from "lucide-react";
import teleinLogo from "@/assets/telein-logo.png";

const formSchema = z.object({
  name: z.string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(100, "Nome muito longo"),
  company: z.string()
    .trim()
    .min(2, "Nome da empresa é obrigatório")
    .max(100, "Nome da empresa muito longo"),
  cpfCnpj: z.string()
    .trim()
    .min(11, "CPF/CNPJ inválido")
    .refine((val) => {
      const numbers = val.replace(/\D/g, "");
      return numbers.length === 11 || numbers.length === 14;
    }, "CPF deve ter 11 dígitos ou CNPJ 14 dígitos"),
  email: z.string()
    .trim()
    .email("E-mail inválido")
    .max(255, "E-mail muito longo"),
  phone: z.string()
    .trim()
    .min(14, "Telefone inválido")
    .max(15, "Telefone inválido"),
  password: z.string()
    .min(6, "Senha deve ter no mínimo 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const Index = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  // Pré-preenche o formulário com dados da URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const nome = urlParams.get('nome') || urlParams.get('nomecompleto');
    const empresa = urlParams.get('empresa');
    const cpf = urlParams.get('cpf') || urlParams.get('cpfcnpj');
    const email = urlParams.get('email');
    const telefone = urlParams.get('telefone') || urlParams.get('phone');
    
    if (nome) setValue('name', nome);
    if (empresa) setValue('company', empresa);
    if (cpf) setValue('cpfCnpj', formatCpfCnpj(cpf));
    if (email) setValue('email', email);
    if (telefone) setValue('phone', formatPhone(telefone));
  }, [setValue]);

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      // Captura os parâmetros da URL para passar via GET
      const indiqueeganhe = urlParams.get('indiqueeganhe') || '';
      const conjuntodeanuncio = urlParams.get('conjuntodeanuncio') || '';
      const campanha = urlParams.get('campanha') || '';
      const anuncio = urlParams.get('anuncio') || '';
      const posicionamento = urlParams.get('posicionamento') || '';
      const pixelId = urlParams.get('pixel_id') || '';
      const conversionName = urlParams.get('conversion_name') || '';
      
      // Monta a query string com os parâmetros GET
      const getParams = new URLSearchParams();
      if (indiqueeganhe) getParams.append('indiqueeganhe', indiqueeganhe);
      if (conjuntodeanuncio) getParams.append('conjuntodeanuncio', conjuntodeanuncio);
      if (campanha) getParams.append('campanha', campanha);
      if (anuncio) getParams.append('anuncio', anuncio);
      if (posicionamento) getParams.append('posicionamento', posicionamento);
      if (pixelId) getParams.append('pixel_id', pixelId);
      if (conversionName) getParams.append('conversion_name', conversionName);
      
      const queryString = getParams.toString();
      const backendUrl = `https://interface.telein.com.br/cadastro/backend.php${queryString ? '?' + queryString : ''}`;
      
      // Payload apenas com dados do formulário (via POST)
      const payload = {
        nomecompleto: data.name,
        empresa: data.company,
        cpf: data.cpfCnpj.replace(/\D/g, ""),
        email: data.email,
        telefone: data.phone.replace(/\D/g, ""),
        senhanova: data.password,
        senhanova1: data.confirmPassword,
      };

      console.log("=== DEBUG CADASTRO ===");
      console.log("URL:", backendUrl);
      console.log("Payload sendo enviado (JSON):", payload);
      console.log("Dados do formulário:", data);
      
      // Tenta primeiro com JSON
      let response = await fetch(backendUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("Status da resposta:", response.status);
      
      // Se falhar com JSON, tenta com FormData (formato tradicional de POST)
      if (!response.ok || response.status !== 201) {
        console.log("Tentando com FormData...");
        const formData = new FormData();
        formData.append("nomecompleto", data.name);
        formData.append("empresa", data.company);
        formData.append("cpf", data.cpfCnpj.replace(/\D/g, ""));
        formData.append("email", data.email);
        formData.append("telefone", data.phone.replace(/\D/g, ""));
        formData.append("senhanova", data.password);
        formData.append("senhanova1", data.confirmPassword);
        
        response = await fetch(backendUrl, {
          method: "POST",
          body: formData,
        });
        
        console.log("Status da resposta (FormData):", response.status);
      }
      
      const result = await response.json();
      console.log("Resposta completa do servidor:", result);
      console.log("=== FIM DEBUG ===");

      if (result.ok && response.status === 201) {
        setIsSuccess(true);
        toast({
          title: "Cadastro realizado!",
          description: "Verifique seu e-mail para ativar a conta.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: result.message || "Tente novamente mais tarde.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro de conexão",
        description: "Não foi possível se conectar ao servidor.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Dispara o pixel quando o cadastro for concluído
  useEffect(() => {
    if (isSuccess && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', 'cadastroEcossistema', {
        content_name: 'Cadastro Telein',
        status: 'completed'
      });
      console.log('Evento cadastroEcossistema disparado');
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl shadow-[var(--shadow-elegant)] p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Cadastro criado com sucesso!</h2>
              <p className="text-muted-foreground">
                Verifique seu e-mail para ativar a conta.
              </p>
            </div>
            <Button 
              onClick={() => window.location.href = "https://interface.telein.com.br/cadastro/urareversa_pixel.php"}
              className="w-full"
              size="lg"
            >
              Ir para o login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <img 
              src={teleinLogo} 
              alt="Telein Logo" 
              className="h-16 md:h-20 mx-auto mb-4"
            />
            <p className="text-muted-foreground">
              Ecossistema completo de comunicação inteligente
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Info Section */}
            <div className="space-y-6 order-2 lg:order-1">
              <div className="bg-card rounded-2xl shadow-[var(--shadow-elegant)] p-6 md:p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Você está se cadastrando no ecossistema Telein
                </h2>
                
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Agents de IA 24/7</h3>
                      <p className="text-sm text-muted-foreground">
                        Crie atendentes por IA que respondem clientes instantaneamente, qualificam leads e agendam reuniões
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <PhoneCall className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">URA Reversa</h3>
                      <p className="text-sm text-muted-foreground">
                        Robô que liga automaticamente para sua base, qualifica interessados e transfere para seu time
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Chat Omnichannel (Chat Telein)</h3>
                      <p className="text-sm text-muted-foreground">
                        Centralize WhatsApp e outros canais em uma única plataforma de atendimento
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Disparo em Massa</h3>
                      <p className="text-sm text-muted-foreground">
                        Envie milhares de mensagens personalizadas via WhatsApp usando API oficial ou convencional
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Discador</h3>
                      <p className="text-sm text-muted-foreground">
                        Sistema que disca automaticamente para sua base e conecta apenas chamadas atendidas ao time
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Chipmassa</h3>
                      <p className="text-sm text-muted-foreground">
                        Números virtuais descartáveis para ativar WhatsApp, Telegram e outros apps em massa
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <PhoneCall className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">IPBX Inteligente</h3>
                      <p className="text-sm text-muted-foreground">
                        PABX IP virtual com recursos avançados de telefonia em nuvem
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="order-1 lg:order-2">
              <div className="bg-card rounded-2xl shadow-[var(--shadow-elegant)] p-6 md:p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  Criar minha conta
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      {...register("name")}
                      aria-invalid={errors.name ? "true" : "false"}
                      className="transition-all"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <Input
                      id="company"
                      placeholder="Nome da sua empresa"
                      {...register("company")}
                      aria-invalid={errors.company ? "true" : "false"}
                    />
                    {errors.company && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.company.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
                    <Input
                      id="cpfCnpj"
                      placeholder="000.000.000-00 ou 00.000.000/0000-00"
                      {...register("cpfCnpj")}
                      onChange={(e) => {
                        const formatted = formatCpfCnpj(e.target.value);
                        setValue("cpfCnpj", formatted);
                      }}
                      aria-invalid={errors.cpfCnpj ? "true" : "false"}
                      maxLength={18}
                    />
                    {errors.cpfCnpj && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.cpfCnpj.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      {...register("email")}
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                    <Input
                      id="phone"
                      placeholder="(00) 00000-0000"
                      {...register("phone")}
                      onChange={(e) => {
                        const formatted = formatPhone(e.target.value);
                        setValue("phone", formatted);
                      }}
                      aria-invalid={errors.phone ? "true" : "false"}
                      maxLength={15}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        {...register("password")}
                        aria-invalid={errors.password ? "true" : "false"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repita a senha"
                        {...register("confirmPassword")}
                        aria-invalid={errors.confirmPassword ? "true" : "false"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={showConfirmPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive" role="alert">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-6"
                    size="lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      "Criar minha conta"
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border">
          <div className="max-w-6xl mx-auto py-8">
            <div className="grid md:grid-cols-3 gap-8 text-sm text-muted-foreground">
              {/* Company Info */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Telein</h4>
                <p className="mb-2">CNPJ: 13.622.342/0001-95</p>
                <p>Av. Forte do Arraial do Novo Bom Jesus, 1331</p>
                <p>Cordeiro, Recife/PE, 50640-000</p>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Contato</h4>
                <p className="mb-1">0800 609 9350</p>
                <p className="mb-1">(81) 3454-2323</p>
                <p className="mb-1">suporte@telein.com.br</p>
                <p>contato@telein.com.br</p>
              </div>

              {/* Copyright */}
              <div>
                <p className="md:text-right">© TELEIN {new Date().getFullYear()}</p>
                <p className="md:text-right">Todos os Direitos Reservados</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
