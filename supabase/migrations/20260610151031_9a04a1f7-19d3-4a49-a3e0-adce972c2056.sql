REVOKE EXECUTE ON FUNCTION public.is_clinic_member(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_clinic_admin(uuid) FROM anon, PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_clinic_member(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_clinic_admin(uuid) TO authenticated;