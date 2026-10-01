revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_conversation_protector() from public, anon, authenticated;
revoke execute on function public.conversation_bot_message() from public, anon, authenticated;
revoke execute on function public.touch_conversation() from public, anon, authenticated;
revoke execute on function public.notify_diary_post() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, app_role) from public, anon;
revoke execute on function public.is_conversation_member(uuid, uuid) from public, anon;