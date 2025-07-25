import React from 'react';
import SectionHeader from "./SectionHeader.jsx";
import {onboardingStore} from "../../stores/onboardingStore.js";
import SaveButton from "./SaveButton.jsx";
import EmptyState from "./EmptyState.jsx";
import {CameraIcon, UserIcon, LinkedinLogoIcon, GithubLogoIcon, XLogoIcon, YoutubeLogoIcon, GlobeIcon, DribbbleLogoIcon, BehanceLogoIcon, StackOverflowLogoIcon, LinkIcon} from "@phosphor-icons/react";
import { Trash } from 'lucide-react';
import toast from 'react-hot-toast';
import { patchPersonalDetails } from '../../services/operations/personalDetailsAPI.js';
import { patchProfileImage, deleteProfileImage } from '../../services/operations/ProfileImageAPI.js';
import ImageCropperModal from './ImageCropperModal.jsx';

function PersonalDetails() {
    const {
        personalDetails,
        originalData,
        updatePersonalDetails,
        updateOriginalData,
        expandedSections,
        updateSocialLink,
        visibleSocialLinks,
        showSocialLinks,
        hideSocialLinks,
        visibleAdditionalDetails,
        showAdditionalDetails,
        hideAdditionalDetails,
        profilePicture,
        updateProfilePicture,
        completedSections,
        markSectionComplete,
        removeSectionComplete
    } = onboardingStore();
    const isExpanded = expandedSections.has('personal');
    const [cropFile, setCropFile] = React.useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];

        e.target.value = "";
        if (!file || !file.type.startsWith("image/")) {
            toast.error("Failed to upload image", {
                style: {
                    border: '1px solid rgba(251, 44, 54, 0.5)',
                    backgroundColor: 'rgba(251, 44, 54, 0.1)',
                    color: '#fb2c36'
                }
            });
            return;
        }
        setCropFile(file);
    };

    const handleCroppedImageSave = async (blob) => {
        const formData = new FormData();
        formData.append("image", blob);

        try {
            const response = await patchProfileImage(formData);
            if (response) {
                updateProfilePicture(response);
            }
        } catch (err) {
            toast.error("Failed to upload image", {
                style: {
                    border: '1px solid rgba(251, 44, 54, 0.5)',
                    backgroundColor: 'rgba(251, 44, 54, 0.1)',
                    color: '#fb2c36'
                }
            });
        } finally {
            setCropFile(null);
        }
    };


    const handleSave = async () => {
        const updatedPayload = {}

        const emptyFields = [];
        if (!personalDetails.fullName.trim()) {
            emptyFields.push("Full Name");
        }
        if (!personalDetails.email.trim()) {
            emptyFields.push("Email");
        }
        if (!personalDetails.phone.trim()) {
            emptyFields.push("Phone no.");
        }

        if (emptyFields.length > 0) {
            toast.error(`Following Fields need to be filled: ${emptyFields.join(', ')}`, {
                style: {
                    border: '1px solid orange',
                    backgroundColor: 'rgba(255, 165, 0, 0.1)',
                    color: 'orange'
                }
            });
            return;
        }

        Object.keys(personalDetails).forEach((key) => {
            if (key === "socialLinks" || key === "dateOfBirth") {
                return;
            }

            if (personalDetails[key] !== originalData.personalDetails[key]) {
                updatedPayload[key] = personalDetails[key];
            }
        });

        const originalDate = originalData.personalDetails.dateOfBirth
            ? new Date(originalData.personalDetails.dateOfBirth).toISOString().split("T")[0]
            : "";
            const currentDate = personalDetails.dateOfBirth
            ? new Date(personalDetails.dateOfBirth).toISOString().split("T")[0]
            : "";
        
        if (currentDate !== originalDate) {
            updatedPayload.dateOfBirth = currentDate;
        }

       const formatLinks = (links) => {
            const isValidUrl = (url) => {
                try {
                    const parsed = new URL(url);
                    return parsed.protocol === "http:" || parsed.protocol === "https:";
                } catch (_) {
                    return false;
                }
            };

            const invalidLinks = links.filter(
                (link) =>
                    typeof link.url === "string" &&
                    link.url.trim() !== "" &&
                    !isValidUrl(link.url.trim())
            );

            if (invalidLinks.length > 0) {
                toast.error("One or more social links are invalid URLs.", {
                    style: {
                        border: '1px solid orange',
                        backgroundColor: 'rgba(255, 165, 0, 0.1)',
                        color: 'orange'
                    }
                });
                return; // return early
            }

            return links
                .filter(
                    (link) =>
                        typeof link.url === "string" &&
                        link.url.trim() !== "" &&
                        typeof link.platform === "string" &&
                        link.platform.trim() !== "" &&
                        isValidUrl(link.url.trim())
                )
                .map(({ platform, url }) => ({
                    platform: platform.trim(),
                    url: url.trim(),
                }));
        };

        
        const currentLinks = formatLinks(personalDetails.socialLinks || []);
        const originalLinks = formatLinks(originalData.personalDetails.socialLinks || []);

        const linksChanged =
            currentLinks.length !== originalLinks.length ||
            currentLinks.some(
                (link, index) =>
                !originalLinks[index] ||
                link.url !== originalLinks[index].url ||
                link.platform !== originalLinks[index].platform
            );

        if (linksChanged) {
            updatedPayload.socialLinks = currentLinks;
        }
        console.log(currentLinks);

        if (Object.keys(updatedPayload).length === 0) {
            toast("No Changes to Save", {
                style: {
                border: '1px solid #3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6'
            }
            })
            return;
        }

        try {
            await patchPersonalDetails(updatedPayload);
            updateOriginalData({personalDetails: personalDetails});
            await markSectionComplete("personal");
        } catch (error) {
            console.error("Update failed", error)
        }

    }

    const socialPlatformsList = [
        { platform: "LinkedIn", icon: LinkedinLogoIcon, key: "LinkedIn" },
        { platform: "GitHub", icon: GithubLogoIcon, key: "GitHub" },
        { platform: "X", icon: XLogoIcon, key: "Twitter" },
        { platform: "YouTube", icon: YoutubeLogoIcon, key: "YouTube" },
        { platform: "Dribbble", icon: DribbbleLogoIcon, key: "Dribbble" },
        { platform: "Behance", icon: BehanceLogoIcon, key: "Behance" },
        { platform: "StackOverflow", icon: StackOverflowLogoIcon, key: "Stackoverflow" },
        { platform: "Website", icon: GlobeIcon, key: "Website" },
    ];

    const additionaDetailsFields = [
        {key: "dateOfBirth", label: "Date of Birth", type: "date" },
        {key: "nationality", label: "Nationality", type: "text" },
        {key: "genderPronoun", label: "Gender Pronoun", type: "select", options: ["He/Him", "She/Her", "They/Them", "Prefer Not to Say"] },
        {key: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed", "Separated", "In a relationship / Partnered", "Prefer Not to Say"] },
        {key: "passport_govt_id", label: "Passport / Govermnent ID", type: "text", },
        {key: "drivingLicense", label: "Driving License", type: "text" },
        {key: "militaryService", label: "Military Service", type: "select", options: ["Currently Serving", "Veteran", "Reserved"] },
        {key: "visa", label: "Visa", type: "text" },
    ]


    function SocialLinkInput({ platform, icon: Icon, value, onChange }) {
        const [isDialogOpen, setDialogOpen] = React.useState(false);
        const [tempLink, setTempLink] = React.useState(value.link || "");
        const [tempUrl, setTempUrl] = React.useState(value.url || "");

        const openDialog = () => {
            setTempLink(value.link || "");
            setDialogOpen(true);
        };

        const saveLink = () => {
            onChange({ ...value, link: tempLink });
            setDialogOpen(false);
        };

        const handleUrlChange = (url) => {
            setTempUrl(url)
        }

        const handleBlur = () => {
            if (tempUrl !== value.url) {
                onChange({ ...value, url: tempUrl });
            }
        };

        return (
            <div className="relative flex w-full items-center space-x-3 min-w-0">
                {/* Left icon inside input */}
                <div className="absolute left-3 pointer-events-none">
                    <Icon className="h-5 w-5 text-[#0A66C2]" />
                </div>

                {/* Input field */}
                <input
                    type="text"
                    value={tempUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onBlur={handleBlur}
                    placeholder={`Enter your ${platform} username or handle`}
                    className="pl-10 pr-10 flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />

                {/* Right clickable link icon */}
                <button
                    type="button"
                    onClick={openDialog}
                    className="absolute right-3 text-gray-400 hover:text-indigo-500"
                >
                    <LinkIcon className="h-5 w-5 mr-2" />
                </button>

                {/* Popup dialog */}
                {isDialogOpen && (
                    <div className="absolute z-10 top-full right-0 mt-2 w-64 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-lg">
                        <label className="block mb-1 text-sm text-gray-300">Paste Link</label>
                        <input
                            type="url"
                            value={tempLink}
                            onChange={(e) => setTempLink(e.target.value)}
                            placeholder="https://example.com/yourprofile"
                            className="w-full px-3 py-2 mb-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveLink}
                                className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

// Usage example in parent component:

    const socialPlatforms = [
        { platform: "LinkedIn", icon: LinkedinLogoIcon, key: "linkedin" },
        { platform: "GitHub", icon: GithubLogoIcon, key: "github" },
        { platform: "X", icon: XLogoIcon, key: "x" },
        { platform: "YouTube", icon: YoutubeLogoIcon, key: "youtube" },
        { platform: "Dribbble", icon: DribbbleLogoIcon, key: "dribbble" },
        { platform: "Behance", icon: BehanceLogoIcon, key: "behance" },
        { platform: "StackOverflow", icon: StackOverflowLogoIcon, key: "stackoverflow" },
        { platform: "Website", icon: GlobeIcon, key: "website" },
    ];

    const handleChangeLink = (key, newValue) => {
        updateSocialLink(key, newValue); // expects { url, link }
    };

    const updateRefresh = () => {
        try {
            const originalPersonalDetails = { ...originalData.personalDetails };
            if (originalPersonalDetails.dateOfBirth) {
                const date = new Date(originalPersonalDetails.dateOfBirth);
                if (!isNaN(date)) {
                    originalPersonalDetails.dateOfBirth = date.toISOString().split("T")[0];
                } else {
                    originalPersonalDetails.dateOfBirth = "";
                }
            }
            updatePersonalDetails(originalPersonalDetails);

            // Show all original social links
            const socialVisibilityMap = {};
            (originalPersonalDetails.socialLinks || []).forEach((link) => {
                if (link.platform?.trim()) {
                    socialVisibilityMap[link.platform.trim()] = true;
                }
            });
            showSocialLinks(socialVisibilityMap);

            // Show all additional detail fields with values
            const additionalVisibilityMap = {};
            const additionalDetailKeys = [
                "dateOfBirth",
                "nationality",
                "genderPronoun",
                "maritalStatus",
                "passport_govt_id",
                "drivingLicense",
                "militaryService",
                "visa",
            ];

            additionalDetailKeys.forEach((key) => {
                const value = originalPersonalDetails[key];

                // Special case for dateOfBirth
                if (
                    key === "dateOfBirth"
                        ? !!value && !isNaN(new Date(value).getTime())
                        : value !== null && value !== undefined && value !== ""
                ) {
                    additionalVisibilityMap[key] = true;
                }
            });

            showAdditionalDetails(additionalVisibilityMap);

        } catch (error) {
            console.log("Error occurred", error);
        }
    };


    React.useEffect(() => {
        updateRefresh();
    }, [])

    return (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden max-w-4xl">
            <SectionHeader
                title="Personal Details"
                icon={<UserIcon/>}
                sectionId="personal"
            />

            {isExpanded && (
                <div className="p-6 border-t border-gray-800 space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <div
                                className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center overflow-hidden"
                            >
                                {profilePicture ? (
                                    <img
                                        src={profilePicture}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="h-8 w-8 text-white" />
                                )}
                            </div>

                            {/* Clickable upload icon */}
                            <label
                                htmlFor="profile-upload"
                                className="absolute -bottom-1 -right-1 bg-indigo-600 hover:bg-indigo-700 rounded-full p-2 transition-colors cursor-pointer"
                            >
                                <CameraIcon weight="duotone" className="h-4 w-4 text-white" />
                            </label>
                                {profilePicture && (
                                    <button
                                        onClick={async () => {
                                            await deleteProfileImage();
                                            updateProfilePicture(null);
                                            updateOriginalData({profilePicture: null});
                                        }}
                                        className="absolute -bottom-1 -left-1 bg-red-600 hover:bg-red-700 rounded-full p-2 transition-colors"
                                    >
                                        <Trash className="h-4 w-4 text-white" />
                                    </button>
                                )}
                            <input
                                id="profile-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                        <div>
                            <h4 className="font-medium text-white">Profile Picture</h4>
                            <p className="text-sm text-gray-400">Upload a professional photo</p>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                value={personalDetails.fullName}
                                onChange={(e) => updatePersonalDetails({fullName: e.target.value})}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={personalDetails.email}
                                onChange={(e) => updatePersonalDetails({email: e.target.value})}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={personalDetails.phone}
                                onChange={(e) => updatePersonalDetails({phone: e.target.value})}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={personalDetails.location}
                                onChange={(e) => updatePersonalDetails({location: e.target.value})}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="San Francisco, CA, USA"
                            />
                        </div>
                    </div>

                    {/*Job Title and Personal Info Text Area*/}
                    <div className='space-y-4'>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Job Title
                            </label>
                            <input
                                type="text"
                                value={personalDetails.jobTitle}
                                onChange={(e) => updatePersonalDetails({jobTitle: e.target.value})}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Software Engineer"
                            />
                        </div>
                        {/* <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Personal Info
                            </label>
                            <input
                                type="text"
                                value={personalDetails.personalInfo}
                                onChange={(e) => updatePersonalDetails({personalInfo: e.target.value})}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="About Yourself"
                            />
                        </div> */}
                    </div>

                    {/* Additional Details */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-300">Additional Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {additionaDetailsFields.map(({key, label, type, options}) => {
                                const visible = visibleAdditionalDetails[key]

                                return (
                                    <div key={key}>
                                        {visible ? (
                                            <>
                                                {type === "select" ? (
                                                    <div className='flex'>
                                                        <select
                                                            value={personalDetails[key] || ""}
                                                            onChange={(e) => (updatePersonalDetails({ [key]: e.target.value }))}
                                                            className='w-full mr-3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                                        >
                                                            <option value="">{label}</option>
                                                            {options.map((opt) => (
                                                                <option key={opt} value={opt}>
                                                                    {opt}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            type="button"
                                                            onClick={() => {hideAdditionalDetails(key)}}
                                                        >
                                                            <Trash className='h-5 w-5 text-[#0A66C2] hover:text-white'/>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className='flex relative space-x-3'>
                                                        <input 
                                                            type={type}
                                                            value={personalDetails[key] || ""}
                                                            onChange={(e) => {
                                                                const inputValue = e.target.value;
                                                                updatePersonalDetails({
                                                                    [key]: key === "dateOfBirth"
                                                                        ? inputValue ? new Date(inputValue) : new Date("") // empty date instance
                                                                        : inputValue
                                                                });
                                                            }}
                                                            placeholder={label}
                                                            className='w-full mr-3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                                                        />   
                                                        <button 
                                                            type="button"
                                                            onClick={() => {hideAdditionalDetails(key)}}
                                                        >
                                                            <Trash className='h-5 w-5 text-[#0A66C2] hover:text-white'/>
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <button 
                                                type='button'
                                                onClick={() => {showAdditionalDetails(key)}}
                                                className='w-full px-3 py-2 border border-gray-600 hover:border-indigo-500 hover:text-white rounded-lg transition flex items-center gap-2'
                                            >
                                                + Add {label}
                                            </button>
                                        )}
                                    </div>
                                )
                            })}

                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-300">Social Links</h4>

                        <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {socialPlatformsList.map(({ platform, icon: Icon, key }) => {
                                const value = personalDetails.socialLinks.find((sl) => sl.platform === key) || { url: "", link: "" };

                                return (
                                    <div key={key}>
                                        {visibleSocialLinks[key] ? (
                                            <div className='flex'>
                                                <SocialLinkInput
                                                    key={key}
                                                    platform={platform}
                                                    icon={Icon}
                                                    value={value}
                                                    onChange={(val) => handleChangeLink(key, val)}
                                                />
                                                <button 
                                                    type="button"
                                                    onClick={() => {hideSocialLinks(key)}}
                                                >
                                                    <Trash className='h-5 w-5 text-[#0A66C2] hover:text-white'/>
                                                </button>
                                            </div>
                                        ) : (
                                            <button 
                                                type='button'
                                                onClick={() => {showSocialLinks(key)}}
                                                className='w-full px-3 py-2 border border-gray-600 hover:border-indigo-500 hover:text-white rounded-lg transition flex items-center gap-2'
                                            >
                                                <Icon className="h-5 w-5 z-1 text-[#0A66C2]" />
                                                + {platform}
                                            </button>
                                        )}
                                    </div>
                            )})}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <SaveButton itemId="personal" onSave={handleSave}/>
                    </div>
                </div>
            )}
            {cropFile && (
                <ImageCropperModal
                    file={cropFile}
                    onCancel={() => setCropFile(null)}
                    onSave={handleCroppedImageSave}
                />
            )}
        </div>
    );
}

export default PersonalDetails;