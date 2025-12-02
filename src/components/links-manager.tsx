"use client"

import { useState } from "react"
import { Link, createLink, updateLink, deleteLink } from "@/actions/links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, ExternalLink, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"

interface LinksManagerProps {
    initialLinks: Link[]
}

export function LinksManager({ initialLinks }: LinksManagerProps) {
    const [links, setLinks] = useState<Link[]>(initialLinks)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [currentLink, setCurrentLink] = useState<Link | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        title: "",
        url: "",
        thumbnail_url: "",
        abbreviation: "",
    })

    const resetForm = () => {
        setFormData({
            title: "",
            url: "",
            thumbnail_url: "",
            abbreviation: "",
        })
        setCurrentLink(null)
    }

    const handleAddClick = () => {
        resetForm()
        setIsAddOpen(true)
    }

    const handleEditClick = (link: Link) => {
        setCurrentLink(link)
        setFormData({
            title: link.title,
            url: link.url,
            thumbnail_url: link.thumbnail_url || "",
            abbreviation: link.abbreviation || "",
        })
        setIsEditOpen(true)
    }

    const handleSave = async () => {
        if (!formData.title || !formData.url) {
            toast.error("Título e URL são obrigatórios")
            return
        }

        setIsLoading(true)
        try {
            if (currentLink) {
                // Update
                const updated = await updateLink(currentLink.id, formData)
                setLinks(links.map((l) => (l.id === currentLink.id ? updated : l)))
                toast.success("Link atualizado com sucesso")
                setIsEditOpen(false)
            } else {
                // Create
                const created = await createLink(formData)
                setLinks([created, ...links])
                toast.success("Link criado com sucesso")
                setIsAddOpen(false)
            }
            resetForm()
        } catch (error) {
            toast.error("Erro ao salvar link")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este link?")) return

        setIsLoading(true)
        try {
            await deleteLink(id)
            setLinks(links.filter((l) => l.id !== id))
            toast.success("Link removido com sucesso")
        } catch (error) {
            toast.error("Erro ao remover link")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Links Importantes</h2>
                <Button onClick={handleAddClick}>
                    <Plus className="mr-2 h-4 w-4" /> Novo Link
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {links.map((link) => (
                    <Card key={link.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium line-clamp-1" title={link.title}>
                                {link.title}
                            </CardTitle>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(link)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(link.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4">
                                {link.thumbnail_url ? (
                                    <img
                                        src={link.thumbnail_url}
                                        alt={link.title}
                                        className="h-12 w-12 rounded object-cover border"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = "https://placehold.co/48x48?text=Link"
                                        }}
                                    />
                                ) : (
                                    <div className="h-12 w-12 rounded bg-muted flex items-center justify-center border">
                                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    {link.abbreviation && (
                                        <div className="text-xs font-semibold text-muted-foreground mb-1">
                                            {link.abbreviation}
                                        </div>
                                    )}
                                    <a
                                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
                                    >
                                        Acessar <ExternalLink className="h-3 w-3" />
                                    </a>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {links.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        Nenhum link cadastrado.
                    </div>
                )}
            </div>

            {/* Dialog for Add/Edit */}
            <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsAddOpen(false)
                    setIsEditOpen(false)
                    resetForm()
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditOpen ? "Editar Link" : "Novo Link"}</DialogTitle>
                        <DialogDescription>
                            Preencha os dados do link abaixo.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Título *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Dashboard de Vendas"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="url">URL *</Label>
                            <Input
                                id="url"
                                value={formData.url}
                                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="abbreviation">Abreviação</Label>
                            <Input
                                id="abbreviation"
                                value={formData.abbreviation}
                                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                                placeholder="Ex: DASH"
                            />
                        </div>

                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setIsAddOpen(false)
                            setIsEditOpen(false)
                            resetForm()
                        }}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
