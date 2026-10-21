// Run in the browser console while logged in to the formal student website.
(async () => {
    if (location.hostname !== '210.240.193.193') {
        throw new Error('Please run this on http://210.240.193.193/.');
    }
    const userId = localStorage.getItem('userId');
    const studentName = ['name', 'username', 'userName']
        .map((key) => localStorage.getItem(key))
        .find((value) => String(value || '').trim());
    if (!userId || !studentName) throw new Error('Please sign in to the student account first.');

    const token = localStorage.getItem('jwtToken');
    const response = await fetch(`/api/activities/myJoined/${encodeURIComponent(userId)}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(`Could not load joined topics (HTTP ${response.status}).`);
    const joined = await response.json();
    if (!Array.isArray(joined)) throw new Error('The website did not return a joined-topic list.');

    const records = joined.map((entry) => ({
        studentName: studentName.trim(),
        className: entry?.ActivityGroup?.Activity?.title || '',
        theme: entry?.ActivityGroup?.Group?.groupName || '',
        classId: entry?.ActivityGroup?.Activity?.id,
        topicId: entry?.ActivityGroup?.Group?.id,
    }));
    if (records.some((record) => !record.className.trim() || !record.theme.trim())) {
        throw new Error('Some joined records are missing their class or topic.');
    }
    const payload = {
        format: 'formal-student-topics-v1',
        sourceOrigin: location.origin,
        exportedAt: new Date().toISOString(),
        records,
    };
    const downloadUrl = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'formal-student-topics.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
    console.table(records);
    alert(`Exported ${records.length} joined topic records to formal-student-topics.json.`);
})().catch((error) => {
    console.error(error);
    alert(error.message);
});
