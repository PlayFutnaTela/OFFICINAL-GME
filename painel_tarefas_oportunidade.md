
# Painel de Tarefas por Oportunidade — Especificação Técnica Completa

Este documento descreve **como implementar um Painel de Tarefas** no projeto GEREZIM.
Ele foi organizado para que qualquer IA de código ou desenvolvedor possa implementar o recurso imediatamente.

---

# 📌 Visão Geral

O Painel de Tarefas transforma cada oportunidade em um **processo executável**, adicionando organização, automação e rastreabilidade.

O recurso permite:

- Criar tarefas vinculadas a uma oportunidade  
- Definir prazos, prioridades e status  
- Listar tarefas por oportunidade  
- Integrar automações e IA  
- Gerar alertas e follow-ups  
- Criar uma linha do tempo interna da negociação  

---

# 🧱 Estrutura de Banco de Dados (Supabase / PostgreSQL)

## Tabela: `tasks`

```sql
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  user_id uuid references auth.users(id),

  title text not null,
  description text,
  status text default 'todo',       -- 'todo', 'doing', 'done'
  priority text default 'normal',   -- 'low', 'normal', 'high'

  due_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
```

---

# 🔐 Row Level Security (RLS)

```sql
alter table tasks enable row level security;

create policy "Usuário só vê suas tarefas"
on tasks for select
using (auth.uid() = user_id);

create policy "Usuário só cria suas tarefas"
on tasks for insert
with check (auth.uid() = user_id);

create policy "Usuário só atualiza suas tarefas"
on tasks for update
using (auth.uid() = user_id);
```

---

# ⚙️ Server Actions / Backend

## Criar Tarefa

```ts
export async function createTask(data) {
  const supabase = createClient();
  const { title, description, due_date, priority, opportunity_id } = data;

  const { error } = await supabase.from("tasks").insert({
    title,
    description,
    due_date,
    priority,
    opportunity_id,
    user_id: (await supabase.auth.getUser()).data.user.id,
  });

  if (error) throw error;
  return { success: true };
}
```

---

## Atualizar Status

```ts
export async function updateTaskStatus(task_id, status) {
  const supabase = createClient();

  const { error } = await supabase
    .from("tasks")
    .update({
      status,
      updated_at: new Date(),
    })
    .eq("id", task_id);

  if (error) throw error;
  return { success: true };
}
```

---

## Listar Tarefas por Oportunidade

```ts
export async function getTasks(opportunity_id) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("opportunity_id", opportunity_id)
    .order("due_date", { ascending: true });

  if (error) throw error;
  return data;
}
```

---

# 🖥️ Interface (UI/UX)

## Visual dentro da oportunidade

```
-------------------------------------
📝 TAREFAS DA OPORTUNIDADE
-------------------------------------

+ Criar nova tarefa

[ ] Solicitar fotos do proprietário        (Prazo: Hoje • Alta)
[ ] Confirmar valor mínimo aceito         (Prazo: Amanhã)
[-] Agendar visita com comprador          (Concluída)
[ ] Criar proposta PDF                    (Prazo: 2 dias)
```

---

## Componente React (modelo)

```tsx
export function TaskList({ tasks }) {
  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div
          key={task.id}
          className="p-4 rounded-xl bg-neutral-900 border border-neutral-700 flex justify-between items-center"
        >
          <div>
            <p className="font-semibold">{task.title}</p>
            {task.due_date && (
              <p className="text-sm text-neutral-400">
                Prazo: {new Date(task.due_date).toLocaleDateString()}
              </p>
            )}
          </div>

          <TaskStatusDropdown task={task} />
        </div>
      ))}
    </div>
  );
}
```

---

# 🤖 Automação Inteligente (IA)

A IA pode sugerir tarefas automaticamente com base na categoria:

### Carro
- Solicitar fotos detalhadas  
- Agendar vistoria  
- Validar documentação  

### Imóvel
- Solicitar matrícula  
- Agendar visita  
- Criar galeria profissional  

### Empresa
- Coletar balanço  
- Agendar análise jurídica  
- Criar dossiê de due diligence  

---

### Exemplos de automações

1. Oportunidade criada sem fotos  
   → Criar tarefa automática **"Solicitar fotos"**

2. Pipeline movido para “Proposta Enviada”  
   → Criar tarefa **"Aguardar resposta"**

3. Tarefa de criação de PDF concluída  
   → Habilitar botão **"Enviar Proposta via WhatsApp"**

4. Tarefas atrasadas  
   → Enviar alerta automático ao vendedor

---

# 📊 Linha do Tempo da Negociação

Tabela opcional:

```sql
create table opportunity_logs (
  id uuid primary key default uuid_generate_v4(),
  opportunity_id uuid references opportunities(id),
  message text,
  created_at timestamp default now()
);
```

---

# 🏁 Conclusão

O Painel de Tarefas eleva a plataforma para nível **Enterprise**, trazendo:

- Organização  
- Previsibilidade  
- Automação  
- Profissionalismo  
- Redução de erros  
- Aumento de velocidade no pipeline  

Pronto para implementação imediata.
