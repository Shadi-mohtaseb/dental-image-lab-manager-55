import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, Key, Calendar, Trash2, Shield, ShieldOff } from "lucide-react";
import { DatePickerField } from "@/components/ui/date-picker-field";

interface UserData {
  id: string;
  email: string;
  created_at: string;
  roles: string[];
  subscription: {
    subscription_type: string;
    start_date: string;
    end_date: string | null;
    is_permanent: boolean;
    status: string;
  } | null;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Create user
  const [createOpen, setCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Change email
  const [emailOpen, setEmailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [changedEmail, setChangedEmail] = useState("");

  // Reset password
  const [passOpen, setPassOpen] = useState(false);
  const [newPass, setNewPass] = useState("");

  // Subscription
  const [subOpen, setSubOpen] = useState(false);
  const [subType, setSubType] = useState("monthly");
  const [subEndDate, setSubEndDate] = useState("");
  const [subPermanent, setSubPermanent] = useState(false);
  const [subDays, setSubDays] = useState("");

  const callApi = async (action: string, params: Record<string, unknown> = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("manage-users", {
      body: { action, ...params },
    });
    if (res.error) throw new Error(res.error.message);
    if (res.data?.error) throw new Error(res.data.error);
    return res.data;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await callApi("list_users");
      setUsers(data.users);
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      await callApi("create_user", { email: newEmail, password: newPassword });
      toast({ title: "تم إنشاء المستخدم بنجاح" });
      setCreateOpen(false);
      setNewEmail("");
      setNewPassword("");
      fetchUsers();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleUpdateEmail = async () => {
    if (!selectedUser) return;
    try {
      await callApi("update_email", { user_id: selectedUser.id, new_email: changedEmail });
      toast({ title: "تم تغيير الإيميل بنجاح" });
      setEmailOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      await callApi("reset_password", { user_id: selectedUser.id, new_password: newPass });
      toast({ title: "تم تغيير كلمة المرور بنجاح" });
      setPassOpen(false);
      setNewPass("");
      fetchUsers();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleSetSubscription = async () => {
    if (!selectedUser) return;
    try {
      let endDate = subEndDate;
      if (subType === "days" && subDays) {
        const d = new Date();
        d.setDate(d.getDate() + parseInt(subDays));
        endDate = d.toISOString().split("T")[0];
      } else if (subType === "monthly") {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        endDate = d.toISOString().split("T")[0];
      } else if (subType === "yearly") {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1);
        endDate = d.toISOString().split("T")[0];
      }

      await callApi("set_subscription", {
        user_id: selectedUser.id,
        subscription_type: subType,
        end_date: subPermanent ? null : endDate,
        is_permanent: subPermanent,
      });
      toast({ title: "تم تفعيل الاشتراك بنجاح" });
      setSubOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleRevokeSubscription = async (userId: string) => {
    try {
      await callApi("revoke_subscription", { user_id: userId });
      toast({ title: "تم إلغاء الاشتراك" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      await callApi("delete_user", { user_id: userId });
      toast({ title: "تم حذف المستخدم" });
      fetchUsers();
    } catch (err: any) {
      toast({ title: "خطأ", description: err.message, variant: "destructive" });
    }
  };

  const getSubStatus = (user: UserData) => {
    if (user.roles.includes("admin")) return { label: "مدير", variant: "default" as const };
    if (!user.subscription) return { label: "بدون اشتراك", variant: "secondary" as const };
    if (user.subscription.is_permanent && user.subscription.status === "active")
      return { label: "دائم", variant: "default" as const };
    if (user.subscription.status !== "active")
      return { label: "منتهي", variant: "destructive" as const };
    if (user.subscription.end_date && new Date(user.subscription.end_date) < new Date())
      return { label: "منتهي", variant: "destructive" as const };
    return { label: "فعال", variant: "default" as const };
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">إدارة المستخدمين</h1>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة مستخدم
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة مستخدم جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>كلمة المرور</Label>
                <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" dir="ltr" />
              </div>
              <Button onClick={handleCreateUser} className="w-full">إنشاء المستخدم</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>المستخدمون</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">البريد الإلكتروني</TableHead>
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">الاشتراك</TableHead>
                    <TableHead className="text-right">تاريخ الانتهاء</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const status = getSubStatus(user);
                    const isAdmin = user.roles.includes("admin");
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={isAdmin ? "default" : "secondary"}>
                            {isAdmin ? "مدير" : "مستخدم"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.subscription?.is_permanent
                            ? "دائم"
                            : user.subscription?.end_date || "—"}
                        </TableCell>
                        <TableCell>
                          {!isAdmin && (
                            <div className="flex gap-1 flex-wrap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setSubType("monthly");
                                  setSubPermanent(false);
                                  setSubDays("");
                                  setSubEndDate("");
                                  setSubOpen(true);
                                }}
                              >
                                <Calendar className="w-3 h-3 ml-1" />
                                اشتراك
                              </Button>
                              {user.subscription?.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRevokeSubscription(user.id)}
                                >
                                  <ShieldOff className="w-3 h-3 ml-1" />
                                  إلغاء
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setChangedEmail(user.email || "");
                                  setEmailOpen(true);
                                }}
                              >
                                <Mail className="w-3 h-3 ml-1" />
                                إيميل
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setNewPass("");
                                  setPassOpen(true);
                                }}
                              >
                                <Key className="w-3 h-3 ml-1" />
                                كلمة مرور
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Email Dialog */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تغيير البريد الإلكتروني</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">المستخدم: {selectedUser?.email}</p>
            <div className="space-y-2">
              <Label>البريد الإلكتروني الجديد</Label>
              <Input value={changedEmail} onChange={(e) => setChangedEmail(e.target.value)} type="email" dir="ltr" />
            </div>
            <Button onClick={handleUpdateEmail} className="w-full">تحديث الإيميل</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passOpen} onOpenChange={setPassOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تغيير كلمة المرور</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">المستخدم: {selectedUser?.email}</p>
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة</Label>
              <Input value={newPass} onChange={(e) => setNewPass(e.target.value)} type="password" dir="ltr" />
            </div>
            <Button onClick={handleResetPassword} className="w-full">تحديث كلمة المرور</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={subOpen} onOpenChange={setSubOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>إدارة الاشتراك</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">المستخدم: {selectedUser?.email}</p>
            <div className="space-y-2">
              <Label>نوع الاشتراك</Label>
              <Select value={subType} onValueChange={(v) => {
                setSubType(v);
                setSubPermanent(v === "permanent");
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">أيام محددة</SelectItem>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                  <SelectItem value="permanent">دائم</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {subType === "days" && (
              <div className="space-y-2">
                <Label>عدد الأيام</Label>
                <Input type="number" value={subDays} onChange={(e) => setSubDays(e.target.value)} />
              </div>
            )}

            {subType === "custom" && (
              <div className="space-y-2">
                <Label>تاريخ الانتهاء</Label>
                <DatePickerField value={subEndDate} onChange={setSubEndDate} />
              </div>
            )}

            <Button onClick={handleSetSubscription} className="w-full">
              <Shield className="w-4 h-4 ml-2" />
              تفعيل الاشتراك
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
